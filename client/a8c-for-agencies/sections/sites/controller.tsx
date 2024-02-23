import { type Callback } from '@automattic/calypso-router';
import SitesSidebar from '../../components/sidebar-menu/sites';

export const sitesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = <div>sites</div>;

	next();
};

export const sitesFavoriteContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = <div>sites favorite</div>;

	next();
};
