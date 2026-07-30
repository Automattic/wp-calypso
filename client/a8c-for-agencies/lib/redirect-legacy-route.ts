import page, { type Callback } from '@automattic/calypso-router';

/**
 * Keeps a retired route working by sending it to its replacement, query string intact.
 * Use it whenever a route constant moves, so existing links and bookmarks don't 404.
 * @param destination The path the retired route now lives at.
 */
const redirectLegacyRoute =
	( destination: string ): Callback =>
	( context ) => {
		page.redirect(
			context.querystring ? `${ destination }?${ context.querystring }` : destination
		);
	};

export default redirectLegacyRoute;
