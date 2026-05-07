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
			bullets: [ 'Run your store on the go', 'Real-time analytics', 'WooPayments' ],
		},
	];

	test( 'renders nothing when no cards are provided', () => {
		const { container } = render( <FeaturesSection cards={ [] } /> );
		expect( container.firstChild ).toBeNull();
	} );

	test( 'does not render H3 title text but exposes the title as the card aria-label', () => {
		const { container } = render( <FeaturesSection cards={ baseCards } /> );

		// No visible H3 title rendering — the card stays logo + bullets.
		expect( container.querySelector( 'h3' ) ).toBeNull();
		expect( screen.queryByText( 'WooCommerce' ) ).not.toBeInTheDocument();

		// Title is still announced to assistive tech via aria-label.
		expect(
			screen.getByRole( 'article', { name: 'Automattic for Agencies' } )
		).toBeInTheDocument();
		expect( screen.getByRole( 'article', { name: 'WooCommerce' } ) ).toBeInTheDocument();
	} );

	test( 'renders every bullet for every card', () => {
		render( <FeaturesSection cards={ baseCards } /> );
		expect( screen.getByText( 'Manage all client sites' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Centralized billing' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Run your store on the go' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Real-time analytics' ) ).toBeInTheDocument();
		expect( screen.getByText( 'WooPayments' ) ).toBeInTheDocument();
	} );

	test( 'renders a string logo as an img with the provided alt text', () => {
		render( <FeaturesSection cards={ baseCards } /> );
		const a4aLogo = screen.getByAltText( 'A4A' ) as HTMLImageElement;
		expect( a4aLogo ).toBeInTheDocument();
		expect( a4aLogo.tagName ).toBe( 'IMG' );
		expect( a4aLogo.getAttribute( 'src' ) ).toBe( '/a4a-logo.svg' );
	} );

	test( 'falls back to the card title for img alt text when no explicit logoAlt is provided', () => {
		render(
			<FeaturesSection
				cards={ [
					{
						id: 'jp',
						logo: '/jetpack.svg',
						title: 'Jetpack',
						bullets: [ 'Backups' ],
					},
				] }
			/>
		);
		expect( screen.getByAltText( 'Jetpack' ) ).toBeInTheDocument();
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

	test( 'renders the overflow stack with the "Connected plugins" label and a comma list', () => {
		render(
			<FeaturesSection
				cards={ baseCards }
				overflowItems={ [ 'Jetpack Boost', 'Jetpack Search' ] }
			/>
		);
		expect( screen.getByText( 'Connected plugins' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Jetpack Boost, Jetpack Search' ) ).toBeInTheDocument();
	} );

	test( 'renders only the label and the items in the overflow stack — no leading logo', () => {
		const { container } = render(
			<FeaturesSection cards={ baseCards } overflowItems={ [ 'Jetpack VaultPress Backup' ] } />
		);
		const overflow = container.querySelector( '.connect-screen-features-section__overflow' );
		const children = Array.from( overflow?.children ?? [] );
		expect( children.length ).toBe( 2 );
		expect( children[ 0 ].classList ).toContain(
			'connect-screen-features-section__overflow-label'
		);
		expect( children[ 1 ].classList ).toContain(
			'connect-screen-features-section__overflow-items'
		);
	} );

	test( 'omits the overflow stack when items are absent or empty', () => {
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
		const triple = render(
			<FeaturesSection
				cards={ [
					...baseCards,
					{
						id: 'jetpack',
						logo: '/jetpack-logo.svg',
						title: 'Jetpack',
						bullets: [ 'Real-time backups' ],
					},
				] }
			/>
		);
		expect(
			triple.container.querySelector( '.connect-screen-features-section.has-3-cards' )
		).toBeInTheDocument();
	} );
} );
