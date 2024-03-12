import { Context, type Callback } from '@automattic/calypso-router';
import SitesSidebar from '../../components/sidebar-menu/sites';
import SitesDashboard from './sites-dashboard';
import { SitesDashboardProvider } from './sites-dashboard-provider';

function configureSitesContext( isFavorites: boolean, context: Context ) {
	const category = context.params.category;
	const siteUrl = context.params.siteUrl;
	const siteFeature = context.params.feature;
	const hideListingInitialState = !! siteUrl;

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			siteFeatureInitialState={ siteFeature }
			hideListingInitialState={ hideListingInitialState }
		>
			<SitesDashboard />
		</SitesDashboardProvider>
	);

	context.secondary = <SitesSidebar path={ context.path } />;
}

export const sitesContext: Callback = ( context, next ) => {
	configureSitesContext( false, context );
	next();
};
