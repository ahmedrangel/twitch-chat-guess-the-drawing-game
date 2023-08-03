export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  console.info(loggedIn.value);
  if (!loggedIn.value) {
    return navigateTo("/");
  }
});