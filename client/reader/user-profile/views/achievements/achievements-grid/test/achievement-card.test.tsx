/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import AchievementCard from '../achievement-card';

describe( 'AchievementCard', () => {
	test( 'renders an image when not locked or secret', () => {
		render(
			<AchievementCard
				image="https://example.com/badge.png"
				title="Earned"
				description="A normal badge."
			/>
		);

		const img = screen.getByRole( 'presentation' );
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'src', 'https://example.com/badge.png' );
	} );

	test( 'renders a lock icon and applies .is-locked when locked', () => {
		const { container } = render( <AchievementCard locked title="Locked" description="Hidden." /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '.achievement-card.is-locked' ) ).not.toBeNull();
		expect( container.querySelector( '.achievement-card__icon--lock svg' ) ).not.toBeNull();
	} );

	test( 'applies .is-secret when secret', () => {
		const { container } = render(
			<AchievementCard secret title="Secret achievement" description="Mystery." />
		);

		expect( container.querySelector( '.achievement-card.is-secret' ) ).not.toBeNull();
	} );

	test( 'applies both modifier classes and renders lock icon when locked + secret', () => {
		const { container } = render(
			<AchievementCard locked secret title="Secret achievement" description="Mystery." />
		);

		expect( container.querySelector( 'img' ) ).toBeNull();
		const root = container.querySelector( '.achievement-card.is-locked.is-secret' );
		expect( root ).not.toBeNull();
		expect( container.querySelector( '.achievement-card__icon--lock svg' ) ).not.toBeNull();
	} );
} );
