// Annotation2DHandler.js
// 

export default class Annotation2DHandler {
    constructor(dragBoxId, upCallback, needTouchEvent, overCallback) {
        this.dragBox = document.getElementById(dragBoxId);
        this.isMouseDown = false;
        this.isMoveDragBox = false;
        this.isCornerDrag = 0; //0：不是四个角 1：左上角 ：2右上角 3：左下角 4：右下角
        this.startX = 0;
        this.startY = 0;
        this.dragBoxOriginX = 0
        this.dragBoxOriginY = 0
        this.dragBoxOriginWidth = 0;
        this.dragBoxOriginHeight = 0;
        this.moveOffsetX = 0;
        this.moveOffsetY = 0;
        this.needTouchEvent = needTouchEvent

        //抬手回调
        this.upCallbackFunc = upCallback
        //结束回调
        this.overCallback = overCallback

        // 误操作判断阈值 单位像素
        this.faultOperateDragBoxValue = 60 * this.dragBox.parentNode.offsetWidth / 1920

        // 标注框数组，维护当前所有标注框dom元素
        this.annotations = []

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.resetDragBox = this.resetDragBox.bind(this)
        this.removeAllAnnotations = this.removeAllAnnotations.bind(this)
        this.checkIsPointInConrer = this.checkIsPointInConrer.bind(this)
        this.calculateDistance = this.calculateDistance.bind(this)

        this.init(needTouchEvent);
    }

    init(needTouchEvent) {
        let targetNode = this.dragBox.parentNode
        if (targetNode) {
            targetNode.addEventListener('mousedown', this.handleMouseDown);
            targetNode.addEventListener('mousemove', this.handleMouseMove);
            targetNode.addEventListener('mouseup', this.handleMouseUp);
            if (needTouchEvent) {
                targetNode.addEventListener('touchstart', this.handleTouchStart);
                targetNode.addEventListener('touchmove', this.handleTouchMove);
                targetNode.addEventListener('touchend', this.handleTouchEnd);
            }
        } else {
            console.log("没有找到img画布 或 canvas画布")
        }

    }

    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    checkIsPointInConrer(px, py) {

        // 阈值，5像素
        const conner_distance_threshold = 10

        // 如果当前dragbox是隐藏状态，则此函数不做判断，默认不是拉四个角
        if (this.dragBox.style.visibility == "hidden") {
            this.isCornerDrag = 0
            return
        }

        // 左上角坐标及右下角坐标，利用这些值可拼凑出四个角的坐标
        const left_top_x = this.dragBox.getBoundingClientRect().left
        const left_top_y = this.dragBox.getBoundingClientRect().top
        const right_bottom_x = this.dragBox.getBoundingClientRect().left + this.dragBox.getBoundingClientRect().width
        const right_bottom_y = this.dragBox.getBoundingClientRect().top + this.dragBox.getBoundingClientRect().height

        //
        if (this.calculateDistance(px, py, left_top_x, left_top_y) <= conner_distance_threshold) {
            // 是否在左上角
            this.isCornerDrag = 1
        } else if (this.calculateDistance(px, py, right_bottom_x, left_top_y) <= conner_distance_threshold) {
            // 是否在右上角
            this.isCornerDrag = 2
        } else if (this.calculateDistance(px, py, left_top_x, right_bottom_y) <= conner_distance_threshold) {
            // 是否在左下角
            this.isCornerDrag = 3
        } else if (this.calculateDistance(px, py, right_bottom_x, right_bottom_y) <= conner_distance_threshold) {
            // 是否在右下角
            this.isCornerDrag = 4
        } else {
            // 没拽到任何一个角
            this.isCornerDrag = 0
        }
    }

    handleTouchStart(event) {

        this.isMouseDown = true;

        this.checkIsPointInConrer(event.touches[0].clientX, event.touches[0].clientY)

        if (this.isCornerDrag == 0) {
            if (event.target === this.dragBox) {
                this.isMoveDragBox = true
            } else {
                this.isMoveDragBox = false
            }

            if (this.isMoveDragBox == true) {
                this.dragBoxOriginX = this.dragBox.style.marginLeft.replace("px", "")
                this.dragBoxOriginY = this.dragBox.style.marginTop.replace("px", "")
                this.moveOffsetX = event.touches[0].clientX - this.dragBox.parentNode.getBoundingClientRect().left
                this.moveOffsetY = event.touches[0].clientY - this.dragBox.parentNode.getBoundingClientRect().top
            } else {
                this.resetDragBox(true)
                this.startX = event.touches[0].clientX - this.dragBox.parentNode.getBoundingClientRect().left;
                this.startY = event.touches[0].clientY - this.dragBox.parentNode.getBoundingClientRect().top;
                this.dragBox.style.marginLeft = this.startX + 'px'
                this.dragBox.style.marginTop = this.startY + 'px'
            }
        } else {
            this.startX = event.touches[0].clientX
            this.startY = event.touches[0].clientY
            this.dragBoxOriginX = parseFloat(this.dragBox.style.marginLeft.replace("px", ""))
            this.dragBoxOriginY = parseFloat(this.dragBox.style.marginTop.replace("px", ""))
            this.dragBoxOriginWidth = this.dragBox.style.width.replace("px", "")
            this.dragBoxOriginHeight = this.dragBox.style.height.replace("px", "")
        }

        // 阻止默认行为,防止一些默认事件（譬如选中文字啥的）同时发生
        event.preventDefault();
    }

    handleTouchMove(event) {
        if (this.isCornerDrag == 0) {
            if (this.isMouseDown) {

                let true_offsetX = event.touches[0].clientX - this.dragBox.parentNode.getBoundingClientRect().left
                let true_offsetY = event.touches[0].clientY - this.dragBox.parentNode.getBoundingClientRect().top

                if (this.isMoveDragBox) {
                    let parent_rect = this.dragBox.parentNode.getBoundingClientRect()
                    let drag_rect = this.dragBox.getBoundingClientRect()

                    let move_distance_x = parseFloat(this.moveOffsetX - true_offsetX)
                    let move_distance_y = parseFloat(this.moveOffsetY - true_offsetY)
                    let newX = this.dragBoxOriginX - move_distance_x
                    let newY = this.dragBoxOriginY - move_distance_y
                    if (newX < 0) newX = 0
                    if (newY < 0) newY = 0
                    if (newX + drag_rect.width > parent_rect.width) newX = parent_rect.width - drag_rect.width
                    if (newY + drag_rect.height > parent_rect.height) newY = parent_rect.height - drag_rect.height
                    this.dragBox.style.marginLeft = newX.toString() + 'px'
                    this.dragBox.style.marginTop = newY.toString() + 'px'

                } else {
                    // if (true_offsetX < 0 || true_offsetY < 0) return

                    //防拉框超出边界 
                    if (true_offsetX < 0) true_offsetX = 0
                    if (true_offsetY < 0) true_offsetY = 0
                    if (true_offsetX > this.dragBox.parentNode.offsetWidth - 5) true_offsetX = this.dragBox.parentNode.offsetWidth - 5
                    if (true_offsetY > this.dragBox.parentNode.offsetHeight - 5) true_offsetY = this.dragBox.parentNode.offsetHeight - 5
                    //防拉框超出边界

                    const newP_X = Math.min(true_offsetX, this.startX)
                    const newP_Y = Math.min(true_offsetY, this.startY)
                    const new_W = Math.abs(true_offsetX - this.startX)
                    const new_H = Math.abs(true_offsetY - this.startY)
                    this.dragBox.style.marginLeft = newP_X + 'px'
                    this.dragBox.style.marginTop = newP_Y + 'px'
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                }
            }
        } else {
            if (this.isCornerDrag == 1) {
                const newP_X = event.touches[0].clientX - this.dragBox.parentNode.getBoundingClientRect().left
                const offsetW = this.startX - event.touches[0].clientX
                const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                const newP_Y = event.touches[0].clientY - this.dragBox.parentNode.getBoundingClientRect().top
                const offsetH = this.startY - event.touches[0].clientY
                const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                this.dragBox.style.marginTop = newP_Y + 'px'
                this.dragBox.style.marginLeft = newP_X + 'px'
                this.dragBox.style.width = new_W + 'px'
                this.dragBox.style.height = new_H + 'px'
            } else if (this.isCornerDrag == 2) {
                const offsetW = event.touches[0].clientX - this.startX
                const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                const newP_Y = event.touches[0].clientY - this.dragBox.parentNode.getBoundingClientRect().top
                const offsetH = this.startY - event.touches[0].clientY
                const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                this.dragBox.style.marginTop = newP_Y + 'px'
                this.dragBox.style.width = new_W + 'px'
                this.dragBox.style.height = new_H + 'px'
            } else if (this.isCornerDrag == 3) {
                const newP_X = event.touches[0].clientX - this.dragBox.parentNode.getBoundingClientRect().left
                const offsetW = this.startX - event.touches[0].clientX
                const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                const offsetH = event.touches[0].clientY - this.startY
                const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                this.dragBox.style.marginLeft = newP_X + 'px'
                this.dragBox.style.width = new_W + 'px'
                this.dragBox.style.height = new_H + 'px'
            } else if (this.isCornerDrag == 4) {
                const offsetW = event.touches[0].clientX - this.startX
                const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                const offsetH = event.touches[0].clientY - this.startY
                const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                this.dragBox.style.width = new_W + 'px'
                this.dragBox.style.height = new_H + 'px'
            }

            //防止超出边界
            if (this.dragBox.style.marginLeft.replace("px", "") <= 0) this.dragBox.style.marginLeft = "5px"
            if (this.dragBox.style.marginTop.replace("px", "") <= 0) this.dragBox.style.marginTop = "5px"
            console.log(parseFloat(this.dragBox.style.marginLeft.replace("px", "")))
            console.log(parseFloat(this.dragBox.style.width.replace("px", "")))
            console.log(this.dragBox.parentNode.getBoundingClientRect().width)
            if (parseFloat(this.dragBox.style.marginLeft.replace("px", "")) + parseFloat(this.dragBox.style.width.replace("px", "")) >= parseFloat(this.dragBox.parentNode.getBoundingClientRect().width)) {
                this.dragBox.style.width = this.dragBox.parentNode.getBoundingClientRect().width - this.dragBox.style.marginLeft.replace("px", "") - 5 + "px"
            }
            if (parseFloat(this.dragBox.style.marginTop.replace("px", "")) + parseFloat(this.dragBox.style.height.replace("px", "")) >= parseFloat(this.dragBox.parentNode.getBoundingClientRect().height)) {
                this.dragBox.style.height = this.dragBox.parentNode.getBoundingClientRect().height - this.dragBox.style.marginTop.replace("px", "") - 5 + "px"
            }
        }

    }

    handleTouchEnd(event) {
        if (this.isMouseDown == false) return
        //
        const drag_box_width = parseFloat(window.getComputedStyle(this.dragBox).getPropertyValue('width').replace("px", ""))
        const drag_box_height = parseFloat(window.getComputedStyle(this.dragBox).getPropertyValue('height').replace("px", ""))
        // 
        if (this.isCornerDrag == 0) {
            if (this.isMoveDragBox) {
                if (this.upCallbackFunc) {
                    this.upCallbackFunc(false)
                }
            } else {
                if (Math.min(drag_box_width, drag_box_height) < this.faultOperateDragBoxValue) {
                    this.resetDragBox()
                    if(this.overCallback){
                        this.overCallback()
                    }
                } else {
                    if (this.upCallbackFunc) {
                        this.upCallbackFunc(true)
                    }
                }
            }
        } else {
            if (Math.min(drag_box_width, drag_box_height) < this.faultOperateDragBoxValue) {
                this.resetDragBox()
            } else {
                if (this.upCallbackFunc) {
                    this.upCallbackFunc(false)
                }
            }
        }

        this.isMouseDown = false;
    }

    handleMouseDown(event) {

        this.isMouseDown = true;

        this.checkIsPointInConrer(event.clientX, event.clientY)

        if (this.isCornerDrag == 0) {
            if (event.target === this.dragBox) {
                this.isMoveDragBox = true
            } else {
                this.isMoveDragBox = false
            }

            if (this.isMoveDragBox == true) {
                this.dragBoxOriginX = this.dragBox.style.marginLeft.replace("px", "")
                this.dragBoxOriginY = this.dragBox.style.marginTop.replace("px", "")
                this.moveOffsetX = event.clientX - this.dragBox.parentNode.getBoundingClientRect().left
                this.moveOffsetY = event.clientY - this.dragBox.parentNode.getBoundingClientRect().top
            } else {
                this.resetDragBox(true)
                this.startX = event.offsetX;
                this.startY = event.offsetY;
                this.dragBox.style.marginLeft = this.startX + 'px'
                this.dragBox.style.marginTop = this.startY + 'px'
            }
        } else {
            this.startX = event.clientX
            this.startY = event.clientY
            this.dragBoxOriginX = parseFloat(this.dragBox.style.marginLeft.replace("px", ""))
            this.dragBoxOriginY = parseFloat(this.dragBox.style.marginTop.replace("px", ""))
            this.dragBoxOriginWidth = this.dragBox.style.width.replace("px", "")
            this.dragBoxOriginHeight = this.dragBox.style.height.replace("px", "")
        }

        // 阻止默认行为,防止一些默认事件（譬如选中文字啥的）同时发生
        event.preventDefault();
    }

    handleMouseMove(event) {
        if (this.isMouseDown) {

            if (this.isCornerDrag == 0) {

                let true_offsetX = event.clientX - this.dragBox.parentNode.getBoundingClientRect().left
                let true_offsetY = event.clientY - this.dragBox.parentNode.getBoundingClientRect().top

                if (this.isMoveDragBox) {
                    let parent_rect = this.dragBox.parentNode.getBoundingClientRect()
                    let drag_rect = this.dragBox.getBoundingClientRect()

                    let move_distance_x = parseFloat(this.moveOffsetX - true_offsetX)
                    let move_distance_y = parseFloat(this.moveOffsetY - true_offsetY)
                    let newX = this.dragBoxOriginX - move_distance_x
                    let newY = this.dragBoxOriginY - move_distance_y
                    if (newX < 0) newX = 0
                    if (newY < 0) newY = 0
                    if (newX + drag_rect.width > parent_rect.width) newX = parent_rect.width - drag_rect.width
                    if (newY + drag_rect.height > parent_rect.height) newY = parent_rect.height - drag_rect.height
                    this.dragBox.style.marginLeft = newX.toString() + 'px'
                    this.dragBox.style.marginTop = newY.toString() + 'px'

                } else {
                    if (event.offsetX < 0 || event.offsetY < 0) return

                    //防拉框超出边界 
                    if (true_offsetX < 0) true_offsetX = 0
                    if (true_offsetY < 0) true_offsetY = 0
                    if (true_offsetX > this.dragBox.parentNode.offsetWidth - 5) true_offsetX = this.dragBox.parentNode.offsetWidth - 5
                    if (true_offsetY > this.dragBox.parentNode.offsetHeight - 5) true_offsetY = this.dragBox.parentNode.offsetHeight - 5
                    //防拉框超出边界

                    const newP_X = Math.min(true_offsetX, this.startX)
                    const newP_Y = Math.min(true_offsetY, this.startY)
                    const new_W = Math.abs(true_offsetX - this.startX)
                    const new_H = Math.abs(true_offsetY - this.startY)
                    this.dragBox.style.marginLeft = newP_X + 'px'
                    this.dragBox.style.marginTop = newP_Y + 'px'
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                }
            } else {
                if (this.isCornerDrag == 1) {
                    const newP_X = event.clientX - this.dragBox.parentNode.getBoundingClientRect().left
                    const offsetW = this.startX - event.clientX
                    const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                    const newP_Y = event.clientY - this.dragBox.parentNode.getBoundingClientRect().top
                    const offsetH = this.startY - event.clientY
                    const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                    this.dragBox.style.marginTop = newP_Y + 'px'
                    this.dragBox.style.marginLeft = newP_X + 'px'
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                } else if (this.isCornerDrag == 2) {
                    const offsetW = event.clientX - this.startX
                    const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                    const newP_Y = event.clientY - this.dragBox.parentNode.getBoundingClientRect().top
                    const offsetH = this.startY - event.clientY
                    const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                    this.dragBox.style.marginTop = newP_Y + 'px'
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                } else if (this.isCornerDrag == 3) {
                    const newP_X = event.clientX - this.dragBox.parentNode.getBoundingClientRect().left
                    const offsetW = this.startX - event.clientX
                    const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                    const offsetH = event.clientY - this.startY
                    const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                    this.dragBox.style.marginLeft = newP_X + 'px'
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                } else if (this.isCornerDrag == 4) {
                    const offsetW = event.clientX - this.startX
                    const new_W = parseFloat(this.dragBoxOriginWidth) + parseFloat(offsetW)
                    const offsetH = event.clientY - this.startY
                    const new_H = parseFloat(this.dragBoxOriginHeight) + parseFloat(offsetH)
                    this.dragBox.style.width = new_W + 'px'
                    this.dragBox.style.height = new_H + 'px'
                }

                //防止超出边界
                if (this.dragBox.style.marginLeft.replace("px", "") <= 0) this.dragBox.style.marginLeft = "5px"
                if (this.dragBox.style.marginTop.replace("px", "") <= 0) this.dragBox.style.marginTop = "5px"
                if (parseFloat(this.dragBox.style.marginLeft.replace("px", "")) + parseFloat(this.dragBox.style.width.replace("px", "")) >= parseFloat(this.dragBox.parentNode.getBoundingClientRect().width)) {
                    this.dragBox.style.width = this.dragBox.parentNode.getBoundingClientRect().width - this.dragBox.style.marginLeft.replace("px", "") - 5 + "px"
                }
                if (parseFloat(this.dragBox.style.marginTop.replace("px", "")) + parseFloat(this.dragBox.style.height.replace("px", "")) >= parseFloat(this.dragBox.parentNode.getBoundingClientRect().height)) {
                    this.dragBox.style.height = this.dragBox.parentNode.getBoundingClientRect().height - this.dragBox.style.marginTop.replace("px", "") - 5 + "px"
                }
            }
        }
    }

    handleMouseUp(event) {
        if (this.isMouseDown == false) return
        //
        const drag_box_width = parseFloat(window.getComputedStyle(this.dragBox).getPropertyValue('width').replace("px", ""))
        const drag_box_height = parseFloat(window.getComputedStyle(this.dragBox).getPropertyValue('height').replace("px", ""))
        // 
        if (this.isCornerDrag == 0) {
            if (this.isMoveDragBox) {
                if (this.upCallbackFunc) {
                    this.upCallbackFunc(false)
                }
            } else {
                if (Math.min(drag_box_width, drag_box_height) < this.faultOperateDragBoxValue) {
                    this.resetDragBox()
                    if(this.overCallback){
                        this.overCallback()
                    }
                } else {
                    if (this.upCallbackFunc) {
                        this.upCallbackFunc(true)
                    }
                }
            }
        } else {
            if (Math.min(drag_box_width, drag_box_height) < this.faultOperateDragBoxValue) {
                this.resetDragBox()
            } else {
                if (this.upCallbackFunc) {
                    this.upCallbackFunc(false)
                }
            }
        }

        this.isMouseDown = false;
    }

    resetDragBox(flag) {
        if (flag) {
            this.dragBox.style.border = "1px solid red"
            this.dragBox.style.visibility = 'visible';
            this.dragBox.style.width = "0px"
            this.dragBox.style.height = "0px"
        } else {
            this.dragBox.style.visibility = 'hidden';
            this.dragBox.style.border = "0px"
            this.dragBox.style.width = "0px"
            this.dragBox.style.height = "0px"
        }

    }

    removeAllAnnotations() {
        for (let i = 0; i < this.annotations.length; i++) {
            this.dragBox.parentNode.removeChild(this.annotations[i])
        }
        this.annotations.length = 0
    }

    revoke() {
        if (this.annotations.length > 0) {
            this.dragBox.parentNode.removeChild(this.annotations[this.annotations.length - 1])
            this.annotations.pop()
        }
    }

    stopListner() {
        const targetNode = this.dragBox.parentNode;
        targetNode.removeEventListener('mousedown', this.handleMouseDown);
        targetNode.removeEventListener('mousemove', this.handleMouseMove);
        targetNode.removeEventListener('mouseup', this.handleMouseUp);
        if (this.needTouchEvent) {
            targetNode.removeEventListener('touchstart', this.handleTouchStart)
            targetNode.removeEventListener('touchmove', this.handleTouchMove)
            targetNode.removeEventListener('touchdown', this.handleTouchEnd)
        }
        this.resetDragBox()
    }

    restartListner() {
        const targetNode = this.dragBox.parentNode;
        targetNode.addEventListener('mousedown', this.handleMouseDown);
        targetNode.addEventListener('mousemove', this.handleMouseMove);
        targetNode.addEventListener('mouseup', this.handleMouseUp);
        if (this.needTouchEvent) {
            targetNode.addEventListener('touchstart', this.handleTouchStart);
            targetNode.addEventListener('touchmove', this.handleTouchMove);
            targetNode.addEventListener('touchdown', this.handleTouchEnd);
        }
    }

}