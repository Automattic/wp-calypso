/**
 * Internal dependencies
 */
import createConfig from 'lib/create-config';

/**
 * Manages config flags for various deployment builds
 * @module config/index
 */
if ( 'undefined' === typeof window || ! window.configData ) {
	throw new ReferenceError( 'No configuration was found: please see client/config/README.md for more information' );
}

const configData = window.configData;

if ( process.env.NODE_ENV === 'development' ) {
	const match = (
		document.location.search &&
		document.location.search.match( /[?&]flags=([^&]+)(&|$)/ )
	);
	if ( match ) {
		const flags = match[ 1 ].split( ',' );
		flags.forEach( flagRaw => {
			const flag = flagRaw.replace( /^[-+]/, '' );
			if ( /^-/.test( flagRaw ) ) {
				console.log( // eslint-disable-line no-console
					'Config flag disabled via URL:',
					flag
				);
				configData.features[ flag ] = false;
			} else {
				console.log( // eslint-disable-line no-console
					'Config flag enabled via URL:',
					flag
				);
				configData.features[ flag ] = true;
			}
		} );
	}
}

export default createConfig( configData );
