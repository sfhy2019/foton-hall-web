import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer"

export function Add2DLabelSpriteToMesh(labelRenderer,container,mesh,obstacle_info){

    //
    const labelDiv = document.createElement('div')
    labelDiv.className = 'label'
    labelDiv.textContent = obstacle_info ? "Person " + obstacle_info.id : '座舱'
    labelDiv.style.marginTop = '-1em'
    labelDiv.style.backgroundColor = 'rgba(255,255,255,0)'
    labelDiv.style.padding = '2px 5px'
    labelDiv.style.borderRadius = '5px'
    labelDiv.style.fontSize = '12px'
    labelDiv.style.pointerEvents = 'none'
    labelDiv.style.color = 'white'
    labelDiv.style.border = '1px solid white'

    const label = new CSS2DObject(labelDiv)
    label.position.set(0,0,0.75)
    mesh.add(label)
    return label
}