/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FeaturesSection } from '../index';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( s: string ) => s,
	localize: ( Component: React.ComponentType ) => Component,
	withRtl: ( Component: React.ComponentType ) => Component,
} ) );

describe( 'FeaturesSection', () => {
	const baseCards = [
		{
			id: 'a4a',
			logo: '/a4a-logo.svg',
			logoAlt: 'A4A',
			title: 'Automattic for Agencies',
			bullets: [ 'Manage all client sites', 'Centralized billing' ],
		},
		{
			id: 'woo',
			logo: '/woo-logo.svg',
			logoAlt: 'WooCommerce',
			title: 'WooCommerce',
			bullets: [ 'Run your store on the go', 'Real-time analytics', 'Cloud backups' ],
		},
	];

	test( 'renders nothing when no cards are provided', () => {
		const { container } = render( <FeaturesSection cards={ [] } /> );
		expect( container.firstChild ).toBeNull();
	} );

	test( 'renders one heading per card with the title text', () => {
		render( <FeaturesSection cards={ baseCards } /> );
		expect(
			screen.getByRole( 'heading', { name: 'Automattic for Agencies' } )
		).toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'WooCommerce' } ) ).toBeInTheDocument();
	} );

	test( 'renders every bullet for every card', () => {
		render( <FeaturesSection cards={ baseCards } /> );
		expect( screen.getByText( 'Manage all client sites' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Centralized billing' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Run your store on the go' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Real-time analytics' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Cloud backups' ) ).toBeInTheDocument();
	} );

	test( 'renders a string logo as an img with the provided alt text', () => {
		render( <FeaturesSection cards={ baseCards } /> );
		const a4aLogo = screen.getByAltText( 'A4A' ) as HTMLImageElement;
		expect( a4aLogo ).toBeInTheDocument();
		expect( a4aLogo.tagName ).toBe( 'IMG' );
		expect( a4aLogo.getAttribute( 'src' ) ).toBe( '/a4a-logo.svg' );
	} );

	test( 'renders a ReactNode logo inline', () => {
		const cards = [
			{
				id: 'jp',
				logo: <span data-testid="custom-logo">JP</span>,
				title: 'Jetpack',
				bullets: [ 'Backups' ],
			},
		];
		render( <FeaturesSection cards={ cards } /> );
		expect( screen.getByTestId( 'custom-logo' ) ).toBeInTheDocument();
	} );

	test( 'renders the "Also used by" overflow row when items are provided', () => {
		render(
			<FeaturesSection
				cards={ baseCards }
				overflowItems={ [ 'Jetpack Boost', 'Jetpack Search' ] }
			/>
		);
		expect( screen.getByText( 'Also used by: Jetpack Boost, Jetpack Search' ) ).toBeInTheDocument();
	} );

	test( 'omits the "Also used by" overflow row when items are absent or empty', () => {
		const { container, rerender } = render( <FeaturesSection cards={ baseCards } /> );
		expect( container.querySelector( '.connect-screen-features-section__overflow' ) ).toBeNull();
		rerender( <FeaturesSection cards={ baseCards } overflowItems={ [] } /> );
		expect( container.querySelector( '.connect-screen-features-section__overflow' ) ).toBeNull();
	} );

	test( 'tags the wrapper with the card-count modifier so the layout can switch breakpoints', () => {
		const { container } = render( <FeaturesSection cards={ baseCards } /> );
		expect(
			container.querySelector( '.connect-screen-features-section.has-2-cards' )
		).toBeInTheDocument();
		const single = render( <FeaturesSection cards={ [ baseCards[ 0 ] ] } /> );
		expect(
			single.container.querySelector( '.connect-screen-features-section.has-1-cards' )
		).toBeInTheDocument();
	} );
} );
