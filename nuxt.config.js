// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "~/assets/css/drawboard.css",
    "~/assets/css/index.css"
  ],
  app: {
    rootId: "app",
    buildAssetDir: "/_app",
    head: {
      charset: "utf-8",
      viewport: "width=device-width, user-scalable=no",
      htmlAttrs: {
        lang: "es",
      },
      meta: [{ name: "robots", content: "index, follow" }],
      link: [
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Lilita+One", },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Balsamiq+Sans", },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "512x512", href: "/android-chrome-512x512.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/android-chrome-192x192.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#0b0e0f" },
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
