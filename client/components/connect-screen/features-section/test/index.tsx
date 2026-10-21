/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../index';

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

	test( 'tags the wrapper with the card-count modifier so the layout can switch breakpoints', () => {
		const { container } = render( <FeaturesSection cards={ baseCards } /> );
		expect(
			container.querySelector( '.connect-screen-features-section.has-2-card' )
		).toBeInTheDocument();
		const single = render( <FeaturesSection cards={ [ baseCards[ 0 ] ] } /> );
		expect(
			single.container.querySelector( '.connect-screen-features-section.has-1-card' )
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
			triple.container.querySelector( '.connect-screen-features-section.has-3-card' )
		).toBeInTheDocument();
	} );

	describe( 'heroFirstCard prop', () => {
		test( 'adds the has-hero-card modifier when set with multiple cards', () => {
			const { container } = render( <FeaturesSection cards={ baseCards } heroFirstCard /> );
			expect(
				container.querySelector( '.connect-screen-features-section.has-2-card.has-hero-card' )
			).toBeInTheDocument();
		} );

		test( 'omits the modifier with a single card — there is no second row to stand alone in', () => {
			const { container } = render(
				<FeaturesSection cards={ [ baseCards[ 0 ] ] } heroFirstCard />
			);
			expect(
				container.querySelector( '.connect-screen-features-section.has-hero-card' )
			).not.toBeInTheDocument();
		} );

		test( 'omits the modifier when the prop is false / unset', () => {
			const { container } = render( <FeaturesSection cards={ baseCards } /> );
			expect(
				container.querySelector( '.connect-screen-features-section.has-hero-card' )
			).not.toBeInTheDocument();
		} );

		test( 'still applies on the 3-card layout (idempotent with the existing has-3-card hero CSS)', () => {
			const triple = render(
				<FeaturesSection
					heroFirstCard
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
				triple.container.querySelector(
					'.connect-screen-features-section.has-3-card.has-hero-card'
				)
			).toBeInTheDocument();
		} );
	} );
} );
