/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CompactPost from '../compact';

vi.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => false,
} ) );
vi.mock( 'calypso/blocks/reader-excerpt', () => ( { default: () => null } ) );
vi.mock( 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/reader/follow-button', () => ( { default: () => null } ) );
vi.mock( '../featured-asset', () => ( { default: () => null } ) );
vi.mock( '../freshly-pressed-badge', () => ( {
	FreshlyPressedBadge: ( { displayedOn } ) => <div>Freshly Pressed on { displayedOn }</div>,
} ) );

const post = {
	ID: 1,
	site_ID: 1,
	URL: 'https://example.com/post',
	title: 'A featured post',
};

describe( 'CompactPost Freshly Pressed badge', () => {
	it( 'renders the badge above the title when freshlyPressedOn is set', () => {
		render(
			<CompactPost
				post={ post }
				freshlyPressedOn="2026-08-11T12:00:00+00:00"
				postByline={ <div>byline</div> }
			/>
		);

		expect( screen.getByText( /Freshly Pressed on/i ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'A featured post' } ) ).toBeVisible();
	} );

	it( 'does not render the badge when freshlyPressedOn is missing', () => {
		render( <CompactPost post={ post } postByline={ <div>byline</div> } /> );

		expect( screen.queryByText( /Freshly Pressed on/i ) ).not.toBeInTheDocument();
	} );
} );
