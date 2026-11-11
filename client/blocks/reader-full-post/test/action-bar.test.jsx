/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ReaderFollowButton from 'calypso/reader/follow-button';
import ReaderFullPostActionBar from '../action-bar';

jest.mock( 'calypso/reader/follow-button', () => jest.fn( () => null ) );
jest.mock( 'calypso/blocks/comment-button', () => () => null );
jest.mock( 'calypso/blocks/post-edit-button', () => () => null );
jest.mock( 'calypso/reader/like-button', () => () => null );

describe( 'ReaderFullPostActionBar', () => {
	it( 'passes the follow callbacks to the subscribe button', () => {
		const onFollowToggle = jest.fn();
		const onFollowSuccess = jest.fn();

		render(
			<ReaderFullPostActionBar
				post={ { ID: 1, site_ID: 100, URL: 'https://example.com/post' } }
				siteUrl="https://example.com"
				onFollowToggle={ onFollowToggle }
				onFollowSuccess={ onFollowSuccess }
			/>
		);

		expect( ReaderFollowButton ).toHaveBeenCalledWith(
			expect.objectContaining( { onFollowToggle, onFollowSuccess } ),
			undefined
		);
	} );
} );
