import { sprintf } from '@wordpress/i18n';
import { Page, ElementHandle } from 'playwright';

const GLOTPRESS_ORIGINALS_ENDPOINT =
	'https://translate.wordpress.com/api/translations/-query-by-originals';
const GLOTPRESS_PROJECT = 'wpcom';

const selectors = {
	translatableElement: '[data-e2e-string]',
};

interface OriginalString {
	singular: string | null;
	plural?: string;
	context?: string;
}

interface Translation {
	original: OriginalString;
	translations: {
		translation_0: string;
	}[];
}

interface TranslationsResponse {
	[ key: number ]: Translation;
	originals_not_found?: OriginalString[];
}

/**
 * Fetch translations for originals.
 */
async function fetchTranslations(
	originals: OriginalString[],
	locale: string
): Promise< Translation[] | null > {
	const payload = new URLSearchParams( {
		project: GLOTPRESS_PROJECT,
		locale_slug: locale,
		original_strings: JSON.stringify( originals ),
	} );

	const translations = await fetch( GLOTPRESS_ORIGINALS_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: payload.toString(),
	} ).then( ( response ) => response.json() as Promise< TranslationsResponse > );

	// Not found originals are not needed in the payload.
	delete translations.originals_not_found;

	return Object.values( translations );
}

/**
 * Get elements translations.
 */
async function getElementsTranslations(
	elements: ElementHandle[],
	locale: string
): Promise< Translation[] | null > {
	const originals: OriginalString[] = await Promise.all(
		elements.map( async ( element ) => ( {
			singular: await element.getAttribute( 'data-e2e-string' ),
		} ) )
	);

	return fetchTranslations( originals, locale );
}

/**
 * Validate translations on current page.
 *
 * @param {Page} page The underlying page
 */
export async function validatePageTranslations( page: Page, locale: string ): Promise< void > {
	// Default locale doesn't have translations.
	if ( locale === 'en' ) {
		return;
	}

	const translatableElements = await page.$$( selectors.translatableElement );
	const translations = await getElementsTranslations( translatableElements, locale );

	for ( const element of translatableElements ) {
		const singular = await element.getAttribute( 'data-e2e-string' );
		// In order to test translations with placeholders, parameters must be passed as JSON encoded string.
		// For example, `<div data-e2e-string="'Hello, %s!'" data-e2e-string-params={[ 'Jane' ]}}>{ sprintf( __( 'Hello, %s!' ), 'Jane' ) }</div>`.
		const params = await element.getAttribute( 'data-e2e-string-params' );

		// Translation for default locale should match the original.
		let translation =
			translations?.find( ( entry: Translation ) => entry.original.singular === singular )
				?.translations?.[ 0 ]?.translation_0 || null;

		if ( ! translation ) {
			translation = '';
		}

		if ( params ) {
			translation = sprintf( translation, ...JSON.parse( params ) );
		}

		await page.waitForFunction(
			( { element, translation } ) => {
				const elementText = ( element as HTMLElement )?.innerText;

				if ( ! elementText ) {
					throw new Error( `Element rendered with empty inner text: \n${ element.outerHTML }` );
				}

				if ( ! elementText?.trim().includes( translation?.trim() || '' ) ) {
					throw new Error(
						`Element text did not match translation! Expected: "${ translation }" -- Actual: "${ elementText }"`
					);
				}

				return true;
			},
			{ element, translation }
		);
	}
}
