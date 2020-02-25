<template>
  <div id="app" class="container-fluid">
    <Transition mode="out-in" name="slide-up">
      <!-- <keep-alive> -->
      <RouterView/>
      <!-- </keep-alive> -->
    </Transition>
  </div>
</template>

<script>
  export default {
    name: 'ElectronMultipleWindows',
    mounted() {
      console.log('zp::: App mounted')
    },
  }
</script>

<style lang="scss"></style>
