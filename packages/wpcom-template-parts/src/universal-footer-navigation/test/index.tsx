/**
 * @jest-environment jsdom
 */
import languages from '@automattic/languages';
import { render, screen } from '@testing-library/react';
import { languageEntries, PureUniversalNavbarFooter } from '../index';

describe( 'PureUniversalNavbarFooter', () => {
	test( 'renders the five link columns', () => {
		render( <PureUniversalNavbarFooter isLoggedIn={ false } locale="en" /> );

		for ( const column of [ 'Products', 'Features', 'Resources', 'Help', 'Company' ] ) {
			expect( screen.getByText( column ) ).toBeVisible();
		}
	} );

	test( 'renders the language picker for logged-out visitors only', () => {
		const { rerender } = render( <PureUniversalNavbarFooter isLoggedIn={ false } locale="en" /> );
		expect( screen.getByTitle( 'Change Language' ) ).toBeVisible();

		rerender( <PureUniversalNavbarFooter isLoggedIn locale="en" /> );
		expect( screen.queryByTitle( 'Change Language' ) ).not.toBeInTheDocument();
	} );

	test( 'language labels match the canonical names in @automattic/languages', () => {
		for ( const [ code, label ] of languageEntries ) {
			const canonical = languages.find( ( language ) => language.langSlug === code );
			expect( canonical?.name ).toBe( label );
		}
	} );

	test( 'renders the Automattic strip', () => {
		render( <PureUniversalNavbarFooter isLoggedIn={ false } locale="en" /> );

		const workWithUs = screen.getByRole( 'link', { name: 'Remote Jobs' } );
		expect( workWithUs ).toBeVisible();
		expect( workWithUs ).toHaveTextContent( 'Work With Us' );
		expect( screen.getByRole( 'link', { name: 'Automattic' } ) ).toHaveAttribute(
			'href',
			'https://automattic.com'
		);
	} );

	test.each( [
		[
			'white',
			'is-style-text-gray-100-background-white',
			'wpcom-global-nav-footer wpcom-global-nav-footer--2026',
		],
		[
			'dark',
			'is-style-text-white-background-gray-100',
			'wpcom-global-nav-footer wpcom-global-nav-footer--2026 wpcom-global-nav-footer--dark',
		],
	] as const )( 'renders the 2026 %s colorway', ( colorway, sectionClass, footerClass ) => {
		render( <PureUniversalNavbarFooter isLoggedIn={ false } locale="en" colorway={ colorway } /> );

		expect( document.querySelector( '.wpcom-global-nav-footer' ) ).toHaveClass(
			'wpcom-global-nav-footer--2026'
		);
		expect( document.querySelector( '.wpcom-global-nav-footer' ) ).toHaveAttribute(
			'class',
			footerClass
		);
		expect( document.querySelector( '.lp-footer-section' ) ).toHaveClass( sectionClass );
		expect( document.querySelector( 'footer.wpcom-global-nav-footer--2026' ) ).toBeInTheDocument();
		expect( document.querySelector( '.lp-footer-bottom' ) ).toBeInTheDocument();
		expect( document.querySelector( '.lp-footer-legal' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Download our app' } ) ).toHaveAttribute(
			'href',
			'https://apps.wordpress.com/get/?campaign=qrcode-apps'
		);
	} );
} );
