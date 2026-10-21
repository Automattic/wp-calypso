/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialTagFeedHeader } from '../tag-feed-header';

describe( 'SocialTagFeedHeader', () => {
	it( 'renders the hashtag with a leading # as the level-1 heading', () => {
		renderWithProvider( <SocialTagFeedHeader hashtag="wordpress" /> );

		expect( screen.getByRole( 'heading', { level: 1, name: '#wordpress' } ) ).toBeVisible();
	} );

	it( 'preserves the casing of the supplied hashtag', () => {
		renderWithProvider( <SocialTagFeedHeader hashtag="WordPress" /> );

		expect( screen.getByRole( 'heading', { level: 1, name: '#WordPress' } ) ).toBeVisible();
	} );

	it( 'renders a pluralized post count when count is a number', () => {
		renderWithProvider( <SocialTagFeedHeader hashtag="wordpress" count={ 4 } /> );

		expect( screen.getByText( '4 posts' ) ).toBeVisible();
	} );

	it( 'renders the singular post count when count is 1', () => {
		renderWithProvider( <SocialTagFeedHeader hashtag="wordpress" count={ 1 } /> );

		expect( screen.getByText( '1 post' ) ).toBeVisible();
	} );

	it( 'renders the count line even when count is 0', () => {
		renderWithProvider( <SocialTagFeedHeader hashtag="wordpress" count={ 0 } /> );

		expect( screen.getByText( '0 posts' ) ).toBeVisible();
	} );

	it( 'omits the count line when count is undefined', () => {
		const { container } = renderWithProvider( <SocialTagFeedHeader hashtag="wordpress" /> );

		expect( container.querySelector( '.social-tag-feed-header__count' ) ).toBeNull();
	} );

	it( 'omits the count line when count is null', () => {
		const { container } = renderWithProvider(
			<SocialTagFeedHeader hashtag="wordpress" count={ null } />
		);

		expect( container.querySelector( '.social-tag-feed-header__count' ) ).toBeNull();
	} );
} );
