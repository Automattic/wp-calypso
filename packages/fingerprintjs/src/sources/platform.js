'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var browser_1 = require( '../utils/browser' );
function getPlatform() {
	// Android Chrome 86 and 87 and Android Firefox 80 and 84 don't mock the platform value when desktop mode is requested
	var platform = navigator.platform;
	// iOS mocks the platform value when desktop version is requested: https://github.com/fingerprintjs/fingerprintjs/issues/514
	// iPad uses desktop mode by default since iOS 13
	// The value is 'MacIntel' on M1 Macs
	// The value is 'iPhone' on iPod Touch
	if ( platform === 'MacIntel' ) {
		if ( ( 0, browser_1.isWebKit )() && ! ( 0, browser_1.isDesktopSafari )() ) {
			return ( 0, browser_1.isIPad )() ? 'iPad' : 'iPhone';
		}
	}
	return platform;
}
exports.default = getPlatform;
