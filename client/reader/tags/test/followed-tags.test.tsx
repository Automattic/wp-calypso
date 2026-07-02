/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { FollowedTags } from '../followed-tags';
import type { ReaderTag } from '@automattic/api-queries';

jest.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockUseFollowedTags = jest.mocked( useFollowedTags );

const tag = ( slug: string, title: string ): ReaderTag => ( {
	id: slug,
	slug,
	title,
	displayName: title,
	url: `/tag/${ slug }`,
	isFollowing: true,
} );

const mockResult = ( result: { data?: ReaderTag[]; isLoading?: boolean } ) =>
	mockUseFollowedTags.mockReturnValue( result as unknown as ReturnType< typeof useFollowedTags > );

describe( 'FollowedTags', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'always renders the Following heading', () => {
		mockResult( { data: [] } );

		render( <FollowedTags /> );

		expect( screen.getByRole( 'heading', { name: 'Following' } ) ).toBeVisible();
	} );

	it( 'shows a loading spinner while followed tags are loading', () => {
		mockResult( { isLoading: true, data: undefined } );

		const { container } = render( <FollowedTags /> );

		expect( container.querySelector( '.wp-spinner-wrapper' ) ).toBeVisible();
		expect( container.querySelector( '.followed-tags__placeholder' ) ).toBeNull();
		expect( container.querySelector( '.followed-tags__pill' ) ).toBeNull();
	} );

	it( 'shows the empty-state placeholder when the user follows no tags', () => {
		mockResult( { data: [] } );

		const { container } = render( <FollowedTags /> );

		expect( container.querySelector( '.followed-tags__placeholder' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a link for each followed tag and no empty state', () => {
		mockResult( { data: [ tag( 'photography', 'Photography' ), tag( 'travel', 'Travel' ) ] } );

		const { container } = render( <FollowedTags /> );

		expect( container.querySelector( '.followed-tags__placeholder' ) ).toBeNull();
		expect( screen.getByRole( 'link', { name: 'Photography' } ) ).toHaveAttribute(
			'href',
			'/tag/photography'
		);
		expect( screen.getByRole( 'link', { name: 'Travel' } ) ).toHaveAttribute(
			'href',
			'/tag/travel'
		);
	} );

	it( 'records a tracks event when a tag is clicked', async () => {
		const user = userEvent.setup();
		mockResult( { data: [ tag( 'photography', 'Photography' ) ] } );

		render( <FollowedTags /> );
		const link = screen.getByRole( 'link', { name: 'Photography' } );
		// Prevent jsdom from attempting (unimplemented) navigation; we only assert tracking.
		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await user.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_tags_page_following_tag_clicked', {
			tag: 'photography',
		} );
	} );
} );
