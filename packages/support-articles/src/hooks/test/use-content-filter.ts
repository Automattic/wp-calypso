import { resolveRootRelativeHref } from '../use-content-filter';

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

describe( 'resolveRootRelativeHref', () => {
	it( 'resolves links against the support root of an English article', () => {
		expect( resolveRootRelativeHref( '/ssh/', 'https://wordpress.com/support/sftp/' ) ).toBe(
			'https://wordpress.com/support/ssh/'
		);
	} );

	it( 'resolves links against the support root of a localized article', () => {
		expect(
			resolveRootRelativeHref(
				'/wordpress-editor/advanced-block-settings/',
				'https://wordpress.com/pt-br/support/editor/blocos/bloco-de-tabela/'
			)
		).toBe( 'https://wordpress.com/pt-br/support/wordpress-editor/advanced-block-settings/' );
	} );

	it( 'keeps links that already point into a support root', () => {
		expect(
			resolveRootRelativeHref( '/es/support/seo/', 'https://wordpress.com/support/sftp/' )
		).toBe( 'https://wordpress.com/es/support/seo/' );
	} );

	it( 'resolves against the domain root outside support sites', () => {
		expect(
			resolveRootRelativeHref( '/docs/guides/', 'https://developer.wordpress.com/docs/intro/' )
		).toBe( 'https://developer.wordpress.com/docs/guides/' );
	} );

	it( 'returns false when there is no article link', () => {
		expect( resolveRootRelativeHref( '/seo/', '' ) ).toBe( false );
	} );
} );
