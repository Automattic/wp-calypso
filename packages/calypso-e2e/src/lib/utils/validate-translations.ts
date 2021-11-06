import { sprintf } from '@wordpress/i18n';
import { Page, ElementHandle } from 'playwright';

const GLOTPRESS_ORIGINALS_ENDPOINT =
	'https://translate.wordpress.com/api/translations/-query-by-originals';
const GLOTPRESS_PROJECT = 'wpcom';

const selectors = {
	translatableElement: '[data-e2e-string]',
};

type OriginalString = { singular: string; plural?: string; context?: string };
type Translation = {
	original: OriginalString;
	translations: {
		translation_0: string;
	}[];
};

/**
 * Fetch translations for originals.
 */
async function fetchTranslations(
	page: Page,
	originals: OriginalString[],
	locale: string
): Promise< Translation[] | null > {
	const params = {
		url: GLOTPRESS_ORIGINALS_ENDPOINT,
		data: {
			project: GLOTPRESS_PROJECT,
			locale_slug: locale,
			original_strings: JSON.stringify( originals ),
		},
	};

	return page.evaluate( async ( { url, data } ) => {
		const body = new URLSearchParams();
		for ( const key in data ) {
			body.append( key, data[ key as 'project' | 'locale_slug' | 'original_strings' ] );
		}

		return window
			.fetch( url, {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
				},
				body: body.toString(),
			} )
			.then( ( res ) => res.json() )
			.then( ( res ) => {
				delete res.originals_not_found;
				return res;
			} )
			.catch( () => null );
	}, params );
}

/**
 * Get elements translations.
 */
async function getElementsTranslations(
	page: Page,
	elements: ElementHandle[],
	locale: string
): Promise< Translation[] | null > {
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

	return fetchTranslations( page, originals, locale );
}

/**
 * Validate translations on current page.
 *
 * @param {Page} page The underlying page
 */
export async function validatePageTranslations( page: Page, locale: string ): Promise< void > {
	const translatableElements = await page.$$( selectors.translatableElement );
	const translations = await getElementsTranslations( page, translatableElements, locale );

	for ( const element of translatableElements ) {
		const singular = await element.getAttribute( 'data-e2e-string' );
		// In order to test translations with placeholders, parameters must be passed as JSON encoded string.
		// For example, `<div data-e2e-string="'Hello, %s!'" data-e2e-string-params={[ 'Jane' ]}}>{ sprintf( __( 'Hello, %s!' ), 'Jane' ) }</div>`.
		const params = await element.getAttribute( 'data-e2e-string-params' );

		let translation = singular;

		// Translation for default locale should match the original.
		if ( locale !== 'en' ) {
			translation =
				translations?.find( ( entry: Translation ) => entry.original.singular === singular )
					?.translations?.[ 0 ]?.translation_0 || null;
		}

		if ( ! translation ) {
			translation = '';
		}

		if ( params ) {
			translation = sprintf( translation, ...JSON.parse( params ) );
		}

		await page.waitForFunction(
			( { element, translation } ) =>
				( element as HTMLElement )?.innerText?.trim()?.includes( translation?.trim() || '' ),
			{ element, translation }
		);
	}
}
