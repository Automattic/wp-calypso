// Viewport gate for docking; also what `useSmallViewportDefaultClosed` treats
// as the small-viewport threshold. Hosts can override it via
// `setChatDesktopMediaQuery`. Lives in its own module so consumers can import
// it without dragging in the layout manager's component dependencies.
export const DEFAULT_DESKTOP_MEDIA_QUERY = '(min-width: 1200px)';
