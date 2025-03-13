import config from '@automattic/calypso-config';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export default function useWPAdminTheme( siteId: number | null ) {
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const isWPAdmin = config.isEnabled( 'is_odyssey' );

	const customTheme = useMemo( () => {
		// Calypso deals with admin colors already, so skip if not in WP Admin.
		if ( ! isWPAdmin ) {
			return null;
		}
		// All Jetpack sites should be in Jetpack colors, including Atomic sites.
		if ( isSiteJetpack ) {
			return 'is-jetpack';
		}
		// For simple sites, we read the admin color from the body class, and convert it to Calypso theme class.
		for ( const className of document.body.classList ) {
			if ( className.startsWith( 'admin-color-' ) ) {
				return `is-${ className.replace( 'admin-color-', '' ) }`;
			}
		}
		// Otherwise, no custom theme.
		return null;
	}, [ isSiteJetpack, isWPAdmin ] );

	return customTheme;
}
