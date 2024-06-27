<template>
  <header class="header-bg">
    <nav class="nav">
      <div class="nav-left">
        <router-link to="/image-detection" class="nav-item">{{ $t('Header.Title1') }}</router-link>
        <router-link to="/pointcloud-detection" class="nav-item">{{ $t('Header.Title2') }}</router-link>
      </div>
      <h1 class="title">{{ $t('Header.Title0') }}</h1>
      <div class="nav-right">
        <router-link to="/fusion-algorithm" class="nav-item">{{ $t('Header.Title3') }}</router-link>
        <router-link to="/target-detection" class="nav-item">{{ $t('Header.Title4') }}</router-link>
      </div>
    </nav>
  </header>
</template>

<style>
.header-bg {
  height: 6vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/assets/header-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  color: white;
  position: relative;
  padding: 10px;
}
.nav {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 调整上下位置 */
  transform: translateY(-10%);
}
.nav-left, .nav-right {
  display: flex;
  justify-content: space-around;
  width: 25%;
  /* font-size: small; */
  position: relative;
}
.title {
  margin: 0;
  font-size: 1.7em;
  width: 50%;
  text-align: center;
  z-index: 1;
}
.nav-item {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  position: relative;
  display: inline-block;
  font-size: 1em;
  font-weight: bold;
  z-index: 1;
}
.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  background-image: url('/assets/button-3.png');
}
</style>
