<script setup>
const { loggedIn } = useUserSession();
</script>
<template>
  <a class="btn" href="/api/twitch/auth">
    <span>Login with Twitch</span>
  </a>
</template>