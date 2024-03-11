import { Context, type Callback } from '@automattic/calypso-router';
import SitesSidebar from '../../components/sidebar-menu/sites';
import SitesDashboard from './sites-dashboard';

function configureSitesContext( isFavorites: boolean, context: Context ) {
	context.secondary = <SitesSidebar path={ context.path } />;

	const category = context.params.category || 'overview';
	const siteUrl = context.params.siteUrl;
	const siteFeature = context.params.feature;
	const hideSiteList = !! siteUrl;

	context.primary = (
		<SitesDashboard
			currentPage={ 1 }
			category={ category }
			hideSiteList={ hideSiteList }
			isFavorites={ isFavorites }
			siteUrl={ siteUrl }
			siteFeature={ siteFeature }
		/>
	);
}

export const sitesContext: Callback = ( context, next ) => {
	configureSitesContext( false, context );
	next();
};

export const sitesFavoriteContext: Callback = ( context, next ) => {
	configureSitesContext( true, context );
	next();
};
