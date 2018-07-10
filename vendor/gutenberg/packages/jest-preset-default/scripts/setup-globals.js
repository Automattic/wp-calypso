// These are necessary to load TinyMCE successfully
global.URL = window.URL;
global.window.tinyMCEPreInit = {
	// Without this, TinyMCE tries to determine its URL by looking at the
	// <script> tag where it was loaded from, which of course fails here.
	baseURL: 'about:blank',
};
global.window.requestAnimationFrame = setTimeout;
global.window.cancelAnimationFrame = clearTimeout;
global.window.matchMedia = () => ( {
	matches: false,
	addListener: () => {},
	removeListener: () => {},
} );

// Setup fake localStorage
const storage = {};
global.window.localStorage = {
	getItem: ( key ) => key in storage ? storage[ key ] : null,
	setItem: ( key, value ) => storage[ key ] = value,
};

// UserSettings global
global.window.userSettings = { uid: 1 };
