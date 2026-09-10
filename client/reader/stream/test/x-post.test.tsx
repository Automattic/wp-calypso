/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossPost } from '../x-post';
import type { Post } from 'calypso/reader/data/post/cache';

jest.mock( 'calypso/blocks/user-avatar', () => () => <div data-testid="user-avatar" /> );

const post: Post = {
	title: 'X-post: Test post',
	site_URL: 'https://destination.example.com',
	feed_item_ID: 200,
	global_ID: 'x-post-global-id',
	is_seen: false,
};

describe( 'CrossPost', () => {
	it( 'marks the feed item as seen on opening its source post', async () => {
		const user = userEvent.setup();
		const requestMarkAsSeen = jest.fn();
		const { container } = render(
			<CrossPost
				post={ post }
				postKey={ { feedId: 100, postId: 200 } }
				isSeenEnabled
				requestMarkAsSeen={ requestMarkAsSeen }
				handleClick={ jest.fn() }
			/>
		);
		const article = container.querySelector( 'article' );

		expect( article ).not.toBeNull();
		await user.click( article! );

		expect( requestMarkAsSeen ).toHaveBeenCalledWith( {
			feedId: 100,
			feedItemIds: [ 200 ],
			globalIds: [ 'x-post-global-id' ],
		} );
	} );
} );
