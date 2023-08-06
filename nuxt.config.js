// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
      },
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Lilita+One",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Balsamiq+Sans",
        },
      ],
    }
  },
  modules: [
    "nuxt-icon"
  ],
  runtimeConfig: {
    session: {
      name: "nuxt-session",
      password: ""
    },
    twitch: {
      clientId: "",
      clientSecret: ""
    }
  },
  experimental: {
    inlineSSRStyles: false
  }
});
