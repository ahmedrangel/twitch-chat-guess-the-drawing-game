// https://nuxt.com/docs/api/configuration/nuxt-config
export default ({
  devtools: { enabled: true },
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "~/assets/css/drawboard.css"
  ],
  modules: [
    "nuxt-icon"
  ]
});
