import config from '@automattic/calypso-config';
import { useMemo } from 'react';

// We cannot use any of the Calypso state selectors here, as this hook is used in the RootChild component, where there is no Redux context.
export default function useWPAdminTheme() {
	const isWPAdmin = config.isEnabled( 'is_odyssey' );

	const customTheme = useMemo( () => {
		// Calypso deals with admin colors already, so skip if not in WP Admin.
		if ( ! isWPAdmin ) {
			return null;
		}
		// Read the admin color from the body class, and convert it to a Calypso theme class.
		for ( const className of document.body.classList ) {
			if ( className.startsWith( 'admin-color-' ) ) {
				return `is-${ className.replace( 'admin-color-', '' ) }`;
			}
		}
		// Otherwise, no custom theme.
		return null;
	}, [ isWPAdmin ] );

	return customTheme;
}
