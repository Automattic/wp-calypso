/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GenericAchievement from '../generic-achievement';
import type { Achievement } from '@automattic/api-core';

const achievement = ( overrides: Partial< Achievement > = {} ): Achievement => ( {
	achievement_id: 1,
	slug: 'ship_it',
	name: 'Ship It',
	description: 'You published a post.',
	badge_prefix: 'p',
	level: 0,
	date_unlocked: '2026-01-15T00:00:00Z',
	date_created: '2025-01-01',
	image: 'https://example.com/ship.png',
	is_secret: false,
	...overrides,
} );

function renderCard( props: React.ComponentProps< typeof GenericAchievement > ) {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render(
		<QueryClientProvider client={ client }>
			<GenericAchievement { ...props } />
		</QueryClientProvider>
	);
}

describe( 'GenericAchievement context link', () => {
	test( 'renders a "View post" link when blog_id and post_id are set but no comment_id', () => {
		const a = achievement( {
			context: { blog_id: 123, post_id: 45, url: 'https://example.com/post' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		const link = screen.getByRole( 'link', { name: 'View post' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://example.com/post' );
		expect( screen.queryByRole( 'link', { name: 'View comment' } ) ).not.toBeInTheDocument();
		// Inline within the existing caption, not a separate line.
		expect( link.closest( '.achievement-card__caption' ) ).not.toBeNull();
	} );

	test( 'renders a "View comment" link when blog_id, post_id, and comment_id are set', () => {
		const a = achievement( {
			slug: 'got_carried_away',
			context: { blog_id: 123, post_id: 45, comment_id: 67, url: 'https://example.com/comment' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		const link = screen.getByRole( 'link', { name: 'View comment' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://example.com/comment' );
		expect( screen.queryByRole( 'link', { name: 'View post' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders no context link on a cross-user profile', () => {
		const a = achievement( {
			context: { blog_id: 123, post_id: 45, url: 'https://example.com/post' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: false } );

		expect( screen.queryByRole( 'link', { name: /View (post|comment)/ } ) ).not.toBeInTheDocument();
	} );

	test( 'renders no context link when there is no context', () => {
		const a = achievement();

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		expect( screen.queryByRole( 'link', { name: /View (post|comment)/ } ) ).not.toBeInTheDocument();
	} );

	test( 'renders no context link when blog_id or post_id is not a positive value', () => {
		const a = achievement( {
			context: { blog_id: 0, post_id: 45, url: 'https://example.com/post' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		expect( screen.queryByRole( 'link', { name: /View (post|comment)/ } ) ).not.toBeInTheDocument();
	} );

	test( 'falls back to "View post" when comment_id is 0', () => {
		const a = achievement( {
			context: { blog_id: 123, post_id: 45, comment_id: 0, url: 'https://example.com/post' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		expect( screen.getByRole( 'link', { name: 'View post' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'View comment' } ) ).not.toBeInTheDocument();
	} );

	test( 'neutralizes an unsafe javascript: url so it never reaches the href', () => {
		const a = achievement( {
			// eslint-disable-next-line no-script-url
			context: { blog_id: 123, post_id: 45, url: 'javascript:alert(1)' },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		const link = screen.queryByRole( 'link', { name: 'View post' } );
		// The link may still render, but the dangerous protocol must be stripped.
		expect( link?.getAttribute( 'href' ) ?? '' ).not.toMatch( /^javascript:/i );
	} );

	test( 'renders no context link when the url is missing', () => {
		const a = achievement( {
			// @ts-expect-error - exercising a malformed payload missing the url.
			context: { blog_id: 123, post_id: 45 },
		} );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: true } );

		expect( screen.queryByRole( 'link', { name: /View (post|comment)/ } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'GenericAchievement hire date', () => {
	const automattician = ( overrides: Partial< Achievement > = {} ): Achievement =>
		achievement( {
			slug: 'automattician',
			name: 'Automattician',
			is_a8c_only: true,
			date_unlocked: '2012-04-09T00:00:00+00:00',
			...overrides,
		} );

	test( 'renders the hire date for the automattician achievement', () => {
		const a = automattician( { date_hired: '2015-06-01T00:00:00+00:00' } );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: false } );

		const hired = screen.getByText( /Started:/ );
		expect( hired ).toBeVisible();
		expect( hired ).toHaveTextContent( 'Started: Jun 1, 2015' );
		// Inline within the existing caption, prefixed by the CSS middot.
		expect( hired ).toHaveClass( 'achievement-card__caption-context' );
		expect( hired.closest( '.achievement-card__caption' ) ).not.toBeNull();
	} );

	test( 'does not render a hire date on a non-automattician achievement', () => {
		const a = achievement( { date_hired: '2015-06-01T00:00:00+00:00' } );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: false } );

		expect( screen.queryByText( /Started:/ ) ).not.toBeInTheDocument();
	} );

	test( 'does not render a hire date when date_hired is absent', () => {
		const a = automattician();

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: false } );

		expect( screen.queryByText( /Started:/ ) ).not.toBeInTheDocument();
	} );

	test( 'does not render a hire date when date_hired is not a valid date', () => {
		const a = automattician( { date_hired: 'not-a-date' } );

		renderCard( { achievement: a, achievements: [ a ], isOwnProfile: false } );

		expect( screen.queryByText( /Started:/ ) ).not.toBeInTheDocument();
	} );
} );
