// Hosts override this by pre-setting `window.__agentsManagerActions.desktopMediaQuery`
// (the runtime `setChatDesktopMediaQuery` action reaches only the dock). Own
// module so it is importable without the layout manager's component dependencies.
export const DEFAULT_DESKTOP_MEDIA_QUERY = '(min-width: 1200px)';
