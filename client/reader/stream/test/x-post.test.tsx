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
				canMarkSeen
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

	it( 'does not mark the feed item as seen when marking is not allowed', async () => {
		const user = userEvent.setup();
		const requestMarkAsSeen = jest.fn();
		const { container } = render(
			<CrossPost
				post={ post }
				postKey={ { feedId: 100, postId: 200 } }
				canMarkSeen={ false }
				requestMarkAsSeen={ requestMarkAsSeen }
				handleClick={ jest.fn() }
			/>
		);

		await user.click( container.querySelector( 'article' )! );

		expect( requestMarkAsSeen ).not.toHaveBeenCalled();
	} );

	it( 'renders the seen styling when isSeenVisible is true', () => {
		const { container } = render(
			<CrossPost
				post={ post }
				postKey={ { feedId: 100, postId: 200 } }
				canMarkSeen={ false }
				isSeenVisible
				requestMarkAsSeen={ jest.fn() }
				handleClick={ jest.fn() }
			/>
		);

		expect( container.querySelector( 'article' ) ).toHaveClass( 'is-seen' );
	} );

	it( 'omits the seen styling when isSeenVisible is false', () => {
		const { container } = render(
			<CrossPost
				post={ { ...post, is_seen: true } }
				postKey={ { feedId: 100, postId: 200 } }
				canMarkSeen
				isSeenVisible={ false }
				requestMarkAsSeen={ jest.fn() }
				handleClick={ jest.fn() }
			/>
		);

		expect( container.querySelector( 'article' ) ).not.toHaveClass( 'is-seen' );
	} );
} );
