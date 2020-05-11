/**
 * External dependencies
 */
/* eslint-disable import/no-nodejs-modules */
import fs from 'fs';
import path from 'path';
/* eslint-enable import/no-nodejs-modules */

/**
 * Internal dependencies
 */
import { makeLayout } from 'calypso/controller';
import { details, fetchThemeDetailsData, notFoundError } from './controller';
import { getLanguage, getLanguageRouteParam } from 'lib/i18n-utils';
import { setLocaleRawData } from 'state/ui/language/actions';

const translationsCache = {};

// todo: merge with themes' setupLocale
function setupLocale( context, next ) {
	if ( ! context.params.lang ) {
		const localeDataPlaceholder = { '': {} };
		context.store.dispatch( setLocaleRawData( localeDataPlaceholder ) ); // Reset to default locale

		next();
		return;
	}

	const language = getLanguage( context.params.lang );

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
	const langParam = getLanguageRouteParam();

	router( '/theme', ( { res } ) => res.redirect( '/themes' ) );
	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		setupLocale,
		fetchThemeDetailsData,
		details,
		makeLayout,

		// Error handlers
		notFoundError
	);
}
