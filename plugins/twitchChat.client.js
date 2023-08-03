import tmi from "tmi.js";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      tmi: tmi  
    }
  };
});