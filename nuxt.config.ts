// https://nuxt.com/docs/api/configuration/nuxt-config
export default ({
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "~/assets/css/drawboard.css"
  ],
  app: {
    rootId: "app",
    buildAssetDir: "/_app",
    head: {
      charset: "utf-8",
      viewport: "width=device-width, user-scalable=no",
      htmlAttrs: {
        lang: "en",
      }
    }
  },
  modules: [
    "nuxt-icon"
  ],
  ssr: false
});
