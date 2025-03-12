import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useMemo } from 'react';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function StatsMain( {
	children,
	...props
}: {
	siteId: number;
	children: React.ReactNode;
} ) {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme ) }>
			{ children }
		</Main>
	);
}
