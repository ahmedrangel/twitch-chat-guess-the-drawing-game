export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { code, error } = getQuery(event);

  if (!code) {
    // const redirectUrl = getRequestURL(event).href + "/game";
    return sendRedirect(event, `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${config.twitch.clientId}&redirect_uri=http://localhost:3000/api/twitch/auth&scope=${encodeURIComponent("user:read:email")}`);
  }

  const response = await $fetch(`https://id.twitch.tv/oauth2/token?client_id=${config.twitch.clientId}&client_secret=${config.twitch.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000/api/twitch/auth`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  if (error) {
    return sendRedirect(event, "/");
  }

  const twitchUser = await $fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Client-ID": config.twitch.clientId,
      "Authorization": `Bearer ${response.access_token}`,
    }
  }).catch(() => ({}));

  const user = twitchUser.data[0];

  await setUserSession(event, {
    user,
    twitchTokens: {
      access_token: response.access_token
    }
  });

  return sendRedirect(event, "/game");
});