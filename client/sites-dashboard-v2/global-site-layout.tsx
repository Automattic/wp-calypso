import { isEnabled } from '@automattic/calypso-config';
import MySitesNavigation from 'calypso/my-sites/navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SitesDashboardV2 from '.';

export default function globalSiteLayout( feature, subfeature = feature ) {
	return ( context, next ) => {
		if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
			const state = context.store.getState();
			const site = getSelectedSite( state );

			context.primary = (
				<SitesDashboardV2
					queryParams={ {
						search: context.query?.search,
					} }
					selectedSite={ site }
					initialSiteFeature={ feature }
					initialSiteSubfeature={ subfeature }
				/>
			);
			context.secondary = <MySitesNavigation path={ context.path } />;
		}
		next();
	};
}
