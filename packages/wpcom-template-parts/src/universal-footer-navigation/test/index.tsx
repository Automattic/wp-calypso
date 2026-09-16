/**
 * @jest-environment jsdom
 */
import languages from '@automattic/languages';
import { render, screen, within } from '@testing-library/react';
import { languageEntries, PureUniversalNavbarFooter } from '../index';

describe( 'PureUniversalNavbarFooter', () => {
	test( 'renders the five link columns', () => {
		render( <PureUniversalNavbarFooter isLoggedIn={ false } locale="en" /> );

		for ( const column of [ 'Products', 'Features', 'Resources', 'Help', 'Company' ] ) {
			expect( screen.getByText( column ) ).toBeVisible();
		}
	} );

	test( 'tightens the redesigned logo while preserving the legacy viewBox', () => {
		const { container, rerender } = render( <PureUniversalNavbarFooter locale="en" /> );
		expect( container.querySelector( '.lp-footer-logo' ) ).toHaveAttribute(
			'viewBox',
			'0 0 170 36'
		);
		expect( container.querySelector( '.lp-icon--custom-automattic-footer' ) ).toHaveAttribute(
			'viewBox',
			'0 0 126 11'
		);
		rerender( <PureUniversalNavbarFooter colorway="white" locale="en" /> );
		expect( container.querySelector( '.lp-icon--custom-automattic-footer' ) ).toHaveAttribute(
			'viewBox',
			'0 0 143 12'
		);
		expect( container.querySelector( '.lp-footer-logo' ) ).toHaveAttribute(
			'viewBox',
			'0 5.33 170 22.87'
		);
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
		expect( document.querySelector( '.lp-footer-bottom' ) ).toBeVisible();
	} );
	test( 'keeps legal links visible outside collapsed columns', () => {
		render( <PureUniversalNavbarFooter colorway="white" collapseStacks locale="en" /> );
		const legal = screen.getByRole( 'list', { name: 'Legal links' } );
		expect( within( legal ).getByRole( 'link', { name: 'Terms of service' } ) ).toBeVisible();
		expect( within( legal ).getByRole( 'link', { name: 'Privacy policy' } ) ).toBeVisible();
		expect( within( legal ).queryByText( /California/ ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.lp-legal-links__select' ) ).not.toBeInTheDocument();
	} );

	test( 'preserves existing column links while moving legal links into their own row', () => {
		const { container, rerender } = render( <PureUniversalNavbarFooter locale="en" /> );
		const columnLinks = () =>
			Array.from( container.querySelectorAll( '.lp-footer-stack a' ) )
				.filter(
					( link ) =>
						! link.closest(
							'.x-nav-footer--tos, .x-nav-footer--privacy, .x-nav-footer--ccpa-privacy'
						)
				)
				.map( ( link ) => [ link.textContent, link.getAttribute( 'href' ) ] );
		const originalLinks = columnLinks();
		rerender( <PureUniversalNavbarFooter colorway="white" locale="en" /> );
		expect( columnLinks() ).toEqual( originalLinks );
		expect( container.querySelectorAll( '.lp-footer-stack .x-nav-footer--tos' ) ).toHaveLength( 0 );
		expect( screen.getByRole( 'link', { name: 'Download our app' } ) ).toHaveAttribute(
			'href',
			'https://apps.wordpress.com/get/?campaign=qrcode-apps'
		);
	} );

	test( 'shows regional links only when supplied', () => {
		const { rerender } = render(
			<PureUniversalNavbarFooter
				colorway="white"
				locale="en"
				showCaliforniaNotice
				additionalCompanyLinks={
					<button type="button">Do not sell or share my personal information</button>
				}
			/>
		);
		const legal = screen.getByRole( 'list', { name: 'Legal links' } );
		expect(
			within( legal ).getByRole( 'link', { name: 'Privacy notice for California users' } )
		).toBeVisible();
		expect(
			within( legal ).getByRole( 'button', {
				name: 'Do not sell or share my personal information',
			} )
		).toBeVisible();
		rerender( <PureUniversalNavbarFooter colorway="white" locale="en" /> );
		expect( within( legal ).queryByText( /California/ ) ).not.toBeInTheDocument();
		expect( within( legal ).queryByText( /Do not sell/ ) ).not.toBeInTheDocument();
	} );
} );
