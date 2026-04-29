/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { PostCardTimestamp } from '../post-card-timestamp';

describe( 'PostCardTimestamp', () => {
	it( 'renders an absolute time + date in a semantic <time> element', () => {
		const { container } = render(
			<PostCardTimestamp post={ { created_at: '2026-04-28T15:17:50Z', indexed_at: '' } } />
		);

		const timeEl = container.querySelector( 'time' );
		expect( timeEl ).not.toBeNull();
		expect( timeEl ).toHaveAttribute( 'dateTime', '2026-04-28T15:17:50Z' );
		// Locale-dependent text — assert the structural pieces (separator + date
		// fragments) instead of a literal "3:17 PM · Apr 28, 2026".
		expect( timeEl?.textContent ).toMatch( /·/ );
		expect( timeEl?.textContent ).toMatch( /Apr/ );
		expect( timeEl?.textContent ).toMatch( /2026/ );
	} );

	it( 'falls back to indexed_at when created_at is empty', () => {
		const { container } = render(
			<PostCardTimestamp post={ { created_at: '', indexed_at: '2026-04-28T15:17:50Z' } } />
		);
		expect( container.querySelector( 'time' ) ).toHaveAttribute(
			'dateTime',
			'2026-04-28T15:17:50Z'
		);
	} );

	it( 'renders nothing when both timestamps are empty', () => {
		const { container } = render(
			<PostCardTimestamp post={ { created_at: '', indexed_at: '' } } />
		);
		expect( container.querySelector( 'time' ) ).toBeNull();
	} );

	it( 'renders nothing when the timestamp is unparseable', () => {
		const { container } = render(
			<PostCardTimestamp post={ { created_at: 'not a date', indexed_at: '' } } />
		);
		expect( container.querySelector( 'time' ) ).toBeNull();
	} );
} );
