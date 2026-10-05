import { isEnabled } from '@automattic/calypso-config';
import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { getFooterColorway } from '@automattic/wpcom-template-parts';
import { getSiteFragment } from 'calypso/lib/route';
import { GlobalFooter } from './global-footer';

type Props = {
	sectionName: string;
	currentRoute: string;
	isLoggedIn: boolean;
	hasSidebar: boolean;
	hasSelectedSite: boolean;
};

export function PublicMarketplaceFooter( {
	sectionName,
	currentRoute,
	isLoggedIn,
	hasSidebar,
	hasSelectedSite,
}: Props ) {
	const route = removeLocaleFromPathLocaleInFront( currentRoute ?? '' );
	const isManagementRoute =
		/^\/plugins\/(?:manage|scheduled-updates|setup|upload|plans|active|inactive|updates)(?:\/|$)/.test(
			route
		) || /^\/themes\/upload(?:\/|$)/.test( route );

	if (
		! [ 'themes', 'theme', 'plugins' ].includes( sectionName ) ||
		hasSidebar ||
		hasSelectedSite ||
		getSiteFragment( route ) ||
		isManagementRoute
	) {
		return null;
	}

	return (
		<GlobalFooter
			currentRoute={ currentRoute }
			isLoggedIn={ isLoggedIn }
			colorway={ getFooterColorway(
				isEnabled( 'footer-redesign/2026' ),
				isEnabled( 'footer/dark' )
			) }
		/>
	);
}
