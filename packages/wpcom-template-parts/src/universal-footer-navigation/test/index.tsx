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
} );
