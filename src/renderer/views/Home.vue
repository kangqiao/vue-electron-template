<template>
  <div>
    <section class="hero is-dark is-bold">
      <div class="hero-body">
        <br />
        <div class="block has-text-centered">
          <figure class="image is-128x128">
            <img alt="Placeholder image" src="../assets/img/pxblue.png" />
          </figure>
        </div>
        <div class="content has-text-centered">
          <button @click="openNewPage">{{title}}</button>
          <h1 class="title is-4">
            Vue-Electron-Template
          </h1>
          <p class="subtitle is-6">
            The boilerplate for making electron applications using vue.js.
          </p>
          <RouterLink class="button is-info" to="about">
            <i class="material-icons">info</i>
            <span>About</span>
          </RouterLink>
          <RouterLink class="button is-info" to="help">
            <i class="material-icons">help</i>
            <span>Help</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      isShowNewPage: false,
      title: '打开新页面'
    }
  },
  methods: {
    openNewPage() {
      this.isShowNewPage = !this.isShowNewPage;
      if (this.isShowNewPage) {
        this.title = '关闭新页面'
        this.$electron.ipcRenderer.send('showNewPageWindow');
      } else {
        this.title = '打开新页面'
        this.$electron.ipcRenderer.send('hideNewPageWindow');
      }
    },
  },
})
</script>

<style>
.hero-body {
  height: 100vh;
}
</style>
