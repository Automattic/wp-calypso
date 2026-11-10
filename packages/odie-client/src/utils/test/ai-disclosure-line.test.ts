import { __, hasTranslation, resetLocaleData, setLocaleData } from '@wordpress/i18n';
import { getAiDisclosureLine as getLine } from '../ai-disclosure-line';

const getAiDisclosureLine = ( productName?: string ) =>
	getLine( productName, { __, hasTranslation } );

const SOURCE = 'You’re chatting with AI from %s Support.';
const GENERIC = 'You’re chatting with AI.';

describe( 'getAiDisclosureLine', () => {
	afterEach( () => {
		resetLocaleData( undefined, 'default' );
	} );

	it( 'names the product in English when there is no translation', () => {
		expect( getAiDisclosureLine( 'WordPress.com' ) ).toEqual( {
			text: 'You’re chatting with AI from WordPress.com Support.',
			isEnglish: true,
		} );
	} );

	it( 'uses the translation when one exists', () => {
		setLocaleData( { [ SOURCE ]: [ 'Estás chateando con la IA del soporte de %s.' ] }, 'default' );

		expect( getAiDisclosureLine( 'Woo' ) ).toEqual( {
			text: 'Estás chateando con la IA del soporte de Woo.',
			isEnglish: false,
		} );
	} );

	it( 'falls back to English when the translation drops the product', () => {
		setLocaleData( { [ SOURCE ]: [ 'Estás chateando con la IA del soporte.' ] }, 'default' );

		expect( getAiDisclosureLine( 'Woo' ) ).toEqual( {
			text: 'You’re chatting with AI from Woo Support.',
			isEnglish: true,
		} );
	} );

	it( 'falls back to English when the translation is only the product', () => {
		setLocaleData( { [ SOURCE ]: [ ' %s ' ] }, 'default' );

		expect( getAiDisclosureLine( 'Woo' ) ).toEqual( {
			text: 'You’re chatting with AI from Woo Support.',
			isEnglish: true,
		} );
	} );

	it.each( [ undefined, '', '   ' ] )(
		'treats a whitespace product as no product (%p)',
		( name ) => {
			expect( getAiDisclosureLine( name ) ).toEqual( { text: GENERIC, isEnglish: true } );
		}
	);

	it( 'trims the product name', () => {
		expect( getAiDisclosureLine( ' Woo ' ).text ).toBe(
			'You’re chatting with AI from Woo Support.'
		);
	} );

	it( 'translates the line without a product', () => {
		setLocaleData( { [ GENERIC ]: [ 'Estás chateando con la IA.' ] }, 'default' );

		expect( getAiDisclosureLine() ).toEqual( {
			text: 'Estás chateando con la IA.',
			isEnglish: false,
		} );
	} );
} );
