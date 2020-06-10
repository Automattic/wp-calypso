/**
 * External dependencies
 */
import UserAgent from 'express-useragent';

/**
 * Internal dependencies
 */
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import versionCompare from 'lib/version-compare';

export const shouldRedirectGutenberg = ( state, siteId ) => {
	if ( window && window.navigator ) {
		// Safari 13 implemented strict cross-site cookie restrictions,
		// which cause the editor iframe to fail loading. Always redirect Safari 13+.
		const { isSafari, version } = UserAgent.parse( window.navigator.userAgent );
		if ( isSafari && versionCompare( version, 13, '>=' ) ) {
			return true;
		}
	}

	const validEditors = [ 'gutenberg-redirect', 'gutenberg-redirect-and-style' ];
	const selectedEditor = getSelectedEditor( state, siteId );
	return validEditors.indexOf( selectedEditor ) > -1;
};

export default shouldRedirectGutenberg;
