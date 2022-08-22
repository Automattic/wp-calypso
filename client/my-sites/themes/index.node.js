import { getLanguageRouteParam } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import {
	fetchThemeData,
	fetchThemeFilters,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
} from './controller';
import { validateFilters, validateVertical } from './validate-filters';

const debug = debugFactory( 'calypso:pages' );

const middlewarelogger = ( name ) => ( context, next ) => {
	debug( `Running ${ name } middleware chain...` );
	debug( context.params );
	next();
};

export default function ( router ) {
	// Redirect interim showcase route to permanent one
	router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
		res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
	} );

	const langParam = getLanguageRouteParam();

	const showcaseRoutes = [
		`/${ langParam }/themes/:tier(free|premium)?`,
		`/${ langParam }/themes/:tier(free|premium)?/filter/:filter`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?/filter/:filter`,
	];

	router(
		showcaseRoutes,
		( { params }, next ) => {
			const { vertical } = params;
			// Note: /themes/:site can match /themes/:vertical. The assumption is
			// that every site includes a period, and every vertical does not. If
			// we're processing a site, skip this middleware chain.
			// TODO: Is it possible to handle this in the route definition above?
			if ( vertical?.includes( '.' ) ) {
				next( 'route' );
			}
		},
		middlewarelogger( 'showcase' ),
		ssrSetupLocale,
		fetchThemeFilters,
		validateVertical,
		validateFilters,
		fetchThemeData,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		loggedOut,
		makeLayout
	);
	router( [ '/themes/upload', '/themes/upload/*' ], makeLayout );
	// Redirect legacy (Atlas-based Theme Showcase v4) routes
	router(
		[
			'/themes/:site?/search/:search',
			'/themes/:site?/type/:tier(free|premium)',
			'/themes/:site?/search/:search/type/:tier(free|premium)',
		],
		middlewarelogger( 'search' ),

		redirectSearchAndType
	);
	router(
		[ '/themes/:site?/filter/:filter', '/themes/:site?/filter/:filter/type/:tier(free|premium)' ],
		middlewarelogger( 'filter' ),

		redirectFilterAndType
	);
	// NOTE!!! Matches /themes/:site as well.
	router(
		[ '/themes/:theme/:section(support)?', '/themes/:site/:theme/:section(support)?' ],
		middlewarelogger( 'support' ),

		redirectToThemeDetails
	);
	// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
	router( '/themes/*', middlewarelogger( 'wildcard' ), fetchThemeData, loggedOut, makeLayout );
}
