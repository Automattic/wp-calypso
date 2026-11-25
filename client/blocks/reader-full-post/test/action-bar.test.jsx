/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ReaderFollowButton from 'calypso/reader/follow-button';
import ReaderFullPostActionBar from '../action-bar';

vi.mock( 'calypso/reader/follow-button', () => ( { default: vi.fn( () => null ) } ) );
vi.mock( 'calypso/blocks/comment-button', () => ( { default: () => null } ) );
vi.mock( 'calypso/blocks/post-edit-button', () => ( { default: () => null } ) );
vi.mock( 'calypso/reader/like-button', () => ( { default: () => null } ) );

describe( 'ReaderFullPostActionBar', () => {
	it( 'passes the follow callbacks to the subscribe button', () => {
		const onFollowToggle = vi.fn();
		const onFollowSuccess = vi.fn();

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
