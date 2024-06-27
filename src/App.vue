<template>
  <div id="app">
    <div v-if="!isLoginPage" class="background">
      <img src="/assets/background.png" alt="Background" class="background-img" />
    </div>
    <Header v-if="!isLoginPage && !isPadView" />
    <main :class="['content', { 'full-screen': isLoginPage }]">
      <router-view />
    </main>
    <Bottom v-if="!isLoginPage" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Bottom from './components/Bottom.vue';

export default {
  components: {
    Header,
    Bottom,
  },
  setup() {
    const route = useRoute();
    const isLoginPage = computed(() => route.path === '/login');
    const isPadView = computed(() => route.path === '/pad-view');
    return {
      isLoginPage,
      isPadView
    };
  },
};
</script>

<style>
#app {
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  flex: 1;
  /* overflow: auto; */
}

.full-screen {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
