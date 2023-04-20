<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

</script>

<style lang="scss">
html {
  background: url("/bg.png") center center;
  background-color: $primary;
  background-size: cover;
  min-height: 100vh;
}
</style>
