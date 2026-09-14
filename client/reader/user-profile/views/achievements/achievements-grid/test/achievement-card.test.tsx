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

	test( 'renders a progress bar and progress/target label when progressTarget is set', () => {
		const { container } = render(
			<AchievementCard
				locked
				title="Daily streak"
				description="Publish for 30 days."
				progressCurrent={ 100 }
				progressTarget={ 300 }
			/>
		);

		expect( container.querySelector( '.achievement-card__progress' ) ).not.toBeNull();
		const bar = screen.getByRole( 'progressbar' );
		expect( bar ).toHaveAttribute( 'aria-valuenow', '100' );
		expect( bar ).toHaveAttribute( 'aria-valuemax', '300' );
		expect( screen.getByText( '100/300' ) ).toBeVisible();
	} );

	test( 'treats missing progressCurrent as 0', () => {
		render(
			<AchievementCard
				locked
				title="Daily streak"
				description="Publish for 30 days."
				progressTarget={ 300 }
			/>
		);

		const bar = screen.getByRole( 'progressbar' );
		expect( bar ).toHaveAttribute( 'aria-valuenow', '0' );
		expect( screen.getByText( '0/300' ) ).toBeVisible();
	} );

	test( 'omits the progress bar when progressTarget is not set', () => {
		const { container } = render( <AchievementCard locked title="Locked" description="Hidden." /> );

		expect( container.querySelector( '.achievement-card__progress' ) ).toBeNull();
		expect( screen.queryByRole( 'progressbar' ) ).toBeNull();
	} );

	test( 'renders the Secret label when isSecret is true', () => {
		render( <AchievementCard title="Hidden Gem" description="You found it." isSecret /> );

		expect( screen.getByText( 'Secret' ) ).toBeVisible();
	} );

	test( 'renders the Retired label when isRetired is true', () => {
		render( <AchievementCard title="Old Badge" description="Long ago." isRetired /> );

		expect( screen.getByText( 'Retired' ) ).toBeVisible();
	} );

	test( 'renders the A8C-only label when isA8cOnly is true', () => {
		render( <AchievementCard title="Internal" description="Staff only." isA8cOnly /> );

		expect( screen.getByText( 'A8C-only' ) ).toBeVisible();
	} );

	test( 'renders multiple status labels alongside the level badge', () => {
		render(
			<AchievementCard
				title="Hidden Gem"
				badge="Level 3"
				description="You found it."
				isSecret
				isRetired
				isA8cOnly
			/>
		);

		expect( screen.getByText( 'Level 3' ) ).toBeVisible();
		expect( screen.getByText( 'Secret' ) ).toBeVisible();
		expect( screen.getByText( 'Retired' ) ).toBeVisible();
		expect( screen.getByText( 'A8C-only' ) ).toBeVisible();
	} );

	test( 'omits all status labels by default', () => {
		render( <AchievementCard title="Plain" description="Nothing special." /> );

		expect( screen.queryByText( 'Secret' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Retired' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'A8C-only' ) ).not.toBeInTheDocument();
	} );
} );
