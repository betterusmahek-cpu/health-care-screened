export const EXTERNAL_MODULES_URL = 'https://cognicompanion-lp-kd89.vercel.app/';

export const redirectToExternalApp = () => {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = EXTERNAL_MODULES_URL;
    } else {
      window.location.href = EXTERNAL_MODULES_URL;
    }
  } catch (e) {
    window.open(EXTERNAL_MODULES_URL, '_blank') || (window.location.href = EXTERNAL_MODULES_URL);
  }
};
