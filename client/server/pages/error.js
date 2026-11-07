import { readFile } from 'fs/promises';
import config from '@automattic/calypso-config';
import { getLanguage, getLanguageSlugs } from '@automattic/i18n-utils';
import { createI18n } from '@wordpress/i18n';
import asyncHandler from 'express-async-handler';
import Lru from 'lru';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import { getErrorPreset } from 'calypso/document/error/presets';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import getAssetFilePath from 'calypso/lib/get-asset-file-path';
import { getLanguageFileUrl } from 'calypso/lib/i18n-utils/switch-locale';
import { renderJsx } from 'calypso/server/render';

const translationsCache = new Lru( { max: 20, maxAge: 60 * 60 * 1000 } );

async function loadTranslations( locale ) {
	if ( locale === 'en' ) {
		return null;
	}
	const cached = translationsCache.get( locale );
	if ( cached !== undefined ) {
		return cached;
	}
	const translations = await readFile(
		getAssetFilePath( `languages/${ locale }-v1.1.json` ),
		'utf-8'
	)
		.then( JSON.parse )
		.catch( async () => {
			const response = await fetch( getLanguageFileUrl( locale ), {
				signal: AbortSignal.timeout( 1500 ),
			} );
			if ( ! response.ok ) {
				return null;
			}
			return response.json();
		} )
		.catch( () => null );
	translationsCache.set( locale, translations );
	return translations;
}

export default asyncHandler( async ( req, res, next ) => {
	if ( ! isA8CForAgencies() && ! isAllowedA4ADashboardHostname( req.hostname ) ) {
		return next( 'route' );
	}

	res.set( 'Cache-Control', 'private, no-store' );
	const params = new URL( req.originalUrl, 'https://agencies.automattic.com' ).searchParams;
	const locales = params.getAll( 'locale' );
	const requestedLocale =
		locales.length === 1 && getLanguageSlugs().includes( locales[ 0 ] )
			? locales[ 0 ]
			: config( 'i18n_default_locale_slug' );
	const language = getLanguage( requestedLocale ) || getLanguage( 'en' );
	let lang = 'en';
	let i18n = createI18n();
	try {
		const translations = await loadTranslations( language.langSlug );
		if ( translations ) {
			i18n = createI18n( translations );
			lang = language.langSlug;
		}
	} catch {
		// Translation availability must never prevent the recovery page from rendering.
	}
	const faviconUrl = isA8CForAgencies()
		? config( 'favicon_url' )
		: config( 'hostname_overrides' )?.[ req.hostname ]?.favicon_url ||
			'/calypso/images/favicons/favicon-a4a-prod.ico';

	res.status( 200 ).send(
		renderJsx( 'error', {
			entrypoint: req.getFilesForChunkGroup( 'entry-public-error' ),
			preset: getErrorPreset( params.toString(), i18n.__ ),
			lang,
			faviconUrl,
		} )
	);
} );
