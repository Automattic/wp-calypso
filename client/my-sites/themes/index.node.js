/**
 * External dependencies
 */
/* eslint-disable import/no-nodejs-modules */
import fs from 'fs';
import path from 'path';
/* eslint-enable import/no-nodejs-modules */
import { localesToSubdomains } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { makeLayout } from 'calypso/controller';
import {
	fetchThemeData,
	fetchThemeFilters,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
} from './controller';
import { validateFilters, validateVertical } from './validate-filters';
import { getLanguage, getLanguageRouteParam } from 'lib/i18n-utils';
import { bindState as bindWpLocaleState } from 'calypso/lib/wp/localization';
import { setLocaleRawData } from 'state/ui/language/actions';

const translationsCache = {};

export function setupLocale( context, next ) {
	bindWpLocaleState( context.store );

	if ( ! context.params.lang ) {
		const localeDataPlaceholder = { '': {} };
		context.store.dispatch( setLocaleRawData( localeDataPlaceholder ) ); // Reset to default locale

		next();
		return;
	}
	const subdomainsToLocales = Object.entries( localesToSubdomains ).reduce(
		( acc, [ key, value ] ) => {
			return {
				...acc,
				[ value ]: key,
			};
		},
		{}
	);
	const langSlug = subdomainsToLocales[ context.params.lang ] || context.params.lang;
	const language = getLanguage( langSlug );

	if ( language ) {
		context.lang = language.langSlug;
		context.isRTL = language.rtl ? true : false;

		if ( typeof translationsCache[ context.lang ] === 'undefined' ) {
			translationsCache[ context.lang ] = JSON.parse(
				fs.readFileSync(
					path.join(
						__dirname,
						'..',
						'..',
						'..',
						'public',
						'evergreen',
						'languages',
						`${ context.lang }-v1.1.json`
					),
					'utf-8'
				)
			);
		}

		const translations = translationsCache[ context.lang ];

		context.store.dispatch( setLocaleRawData( translations ) );
	}

	next();
}

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
		setupLocale,
		fetchThemeFilters,
		validateVertical,
		validateFilters,
		fetchThemeData,
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
		redirectSearchAndType
	);
	router(
		[ '/themes/:site?/filter/:filter', '/themes/:site?/filter/:filter/type/:tier(free|premium)' ],
		redirectFilterAndType
	);
	router(
		[ '/themes/:theme/:section(support)?', '/themes/:site/:theme/:section(support)?' ],
		redirectToThemeDetails
	);
	// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
	router( '/themes/*', fetchThemeData, loggedOut, makeLayout );
}
