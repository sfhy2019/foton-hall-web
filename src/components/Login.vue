<template>
    <div class="login-container">
        <img src="/assets/login_bg.png" class="background"/>
        <img src="/assets/logo.png" class="logo"/>
        <div class="content">
            <h2>{{ $t('Login.Title') }}</h2>
            <div class="login-box">
                <div class="input-group">
                    <label for="username">{{ $t('Login.Username') }}</label>
                    <input type="text" id="username" v-model="username" :placeholder="$t('Login.Placeholder1')">
                </div>
                <div class="input-group">
                    <label for="password">{{ $t('Login.Password') }}</label>
                    <input type="password" id="password" v-model="password" :placeholder="$t('Login.Placeholder2')">
                </div>
                <button @click="login">{{ $t('Login.Button1') }}</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        login(){
            if (this.username === 'admin' && this.password === 'admin') {
                this.$router.push('/image-detection');
            } else {
                alert(this.$t('Login.Tip1'));
            }
        }
    }
}
</script>
<style scoped>
.background {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
.logo {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 150px;
    height: 50px;
}
.content {
    text-align: center;
    width: 400px;
    color: white;
    background-color: rgba(0,0,0,0.8);
    border-radius: 10px;
    transform: translateY(-40%);
    padding: 10px;
}
.login-box {
    padding: 20px;
    border-radius: 10px;
}
.input-group {
    margin-bottom: 15px;
}
input {
    width: 270px;
    padding: 10px;
    margin-top: 5px;
    margin-left: 30px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
button {
    margin-top: 20px;
    width: 100%;
    padding: 10px;
    background-color: #007BFF;
    border: none;
    color: white;
    border-radius: 5px;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}
</style>