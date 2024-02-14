import { type Callback } from '@automattic/calypso-router';

export const sitesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>sites</div>;

	next();
};

export const sitesFavoriteContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>sites favorite</div>;

	next();
};
