<script setup>
const { loggedIn } = useUserSession();
const seoDescription = "Challenge and play with your audience to guess your drawings.";
const seoTitle = "Drawmond";
const seoUrl = "https://drawmond.ahmedrangel.com/";
useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  keywords: "drawmond, drawing, streamer, game, chat, twitch, guessing, draw, sketch",
  // Open Graph
  ogType: "website",
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogUrl: seoUrl,
  ogImage: seoUrl + "/images/drawmond.png"
  // Twitter
  twitterCard: "summary",
  twitterTitle: seoTitle,
  twitterDescription: seoDescription
});
</script>
<template>
  <main id="login">
    <img class="diamond diamond-bg position-absolute top-50 start-50 translate-middle img-fluid" src="/images/diamond-guess-sq.svg">
    <div class="position-absolute top-50 start-50 translate-middle text-center text-white w-100 px-2">
      <div class="mb-4">
        <h1 class="mb-1 drawmond">Drawm<img class="diamond diamond-index img-fluid" src="/images/diamond-guess-sq.svg">nd</h1>
        <h5 class="m-0 drawmond-desc text-dark">Challenge and play with your audience to guess your drawings.</h5>
      </div>
      <a v-if="!loggedIn" class="btn join d-flex justify-content-center align-items-center" href="/api/twitch/auth">
        <Icon class="iconify me-2 h2 m-0" name="simple-icons:twitch" />
        <h2 class="m-0">Join with Twitch</h2>
      </a>
      <NuxtLink v-else class="btn join d-flex justify-content-center align-items-center" to="/game">
        <Icon class="iconify me-2 h2 m-0" name="simple-icons:twitch" />
        <h2 class="m-0">Join with Twitch</h2>
      </NuxtLink>
    </div>
  </main>
</template>
<script>
export default {
};
</script>