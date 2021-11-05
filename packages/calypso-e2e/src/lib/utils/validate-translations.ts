import { sprintf } from '@wordpress/i18n';
import { Page, ElementHandle } from 'playwright';
import request from 'request-promise';

const GLOTPRESS_ORIGINALS_ENDPOINT =
	'https://translate.wordpress.com/api/translations/-query-by-originals';
const GLOTPRESS_PROJECT = 'wpcom';

const selectors = {
	translatableElement: '[data-e2e-string]',
};

type OriginalString = { singular: string };

/**
 * Fetch translations for originals.
 */
async function fetchTranslations(
	originals: OriginalString[],
	locale: string
): Promise< string[] > {
	return request
		.post( GLOTPRESS_ORIGINALS_ENDPOINT, {
			form: {
				project: GLOTPRESS_PROJECT,
				locale_slug: locale,
				original_strings: JSON.stringify( originals ),
			},
		} )
		.then( ( response: any ) => {
			let translations = JSON.parse( response );
			delete translations.originals_not_found;
			translations = Object.values( translations );

			return translations;
		} )
		.catch( () => null );
}

/**
 * Get elements translations.
 */
async function getElementsTranslations(
	elements: ElementHandle[],
	locale: string
): Promise< any > {
	// Default locale doesn't have translations
	if ( locale === 'en' ) {
		return null;
	}

	const originals: OriginalString[] = await Promise.all(
		elements.map( async ( element ) => {
			const singular = ( await element.getAttribute( 'data-e2e-string' ) ) || '';
			return { singular };
		} )
	);

	return fetchTranslations( originals, locale );
}

/**
 * Validate translations on current page.
 *
 * @param {Page} page The underlying page
 */
export async function validatePageTranslations( page: Page, locale: string ): Promise< void > {
	const translatableElements = await page.$$( selectors.translatableElement );
	const translations = await getElementsTranslations( translatableElements, locale );

	for ( const element of translatableElements ) {
		const singular = await element.getAttribute( 'data-e2e-string' );
		// In order to test translations with placeholders, parameters must be passed as JSON encoded string.
		// For example, `<div data-e2e-string="'Hello, %s!'" data-e2e-string-params={[ 'Jane' ]}}>{ sprintf( __( 'Hello, %s!' ), 'Jane' ) }</div>`.
		const params = await element.getAttribute( 'data-e2e-string-params' );

		let translation = singular;

		// Translation for default locale should match the original.
		if ( locale !== 'en' ) {
			const translationEntry =
				translations && translations.find( ( entry: any ) => entry.original.singular === singular );
			translation =
				translationEntry &&
				translationEntry.translations &&
				translationEntry.translations[ 0 ] &&
				translationEntry.translations[ 0 ].translation_0;
		}

		if ( params ) {
			// @ts-ignore
			translation = sprintf( translation, ...JSON.parse( params ) );
		}

		await element.waitForSelector( `:has-text("${ translation }")` );
	}
}
