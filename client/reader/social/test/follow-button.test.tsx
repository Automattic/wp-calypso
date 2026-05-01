/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FollowButton } from '../follow-button';

describe( 'FollowButton', () => {
	it( 'renders a Follow button when not following and not followed by, and triggers onFollow on click', async () => {
		const onFollow = jest.fn();
		const user = userEvent.setup();
		render(
			<FollowButton
				isFollowing={ false }
				isFollowedBy={ false }
				onFollow={ onFollow }
				onUnfollow={ jest.fn() }
			/>
		);
		const button = screen.getByRole( 'button', { name: /^follow$/i } );
		await user.click( button );
		expect( onFollow ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders Follow back when followed by but not following', async () => {
		const onFollow = jest.fn();
		const user = userEvent.setup();
		render(
			<FollowButton
				isFollowing={ false }
				isFollowedBy
				onFollow={ onFollow }
				onUnfollow={ jest.fn() }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /follow back/i } ) );
		expect( onFollow ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders Following when isFollowing and triggers onUnfollow on click', async () => {
		const onUnfollow = jest.fn();
		const user = userEvent.setup();
		render(
			<FollowButton
				isFollowing
				isFollowedBy={ false }
				onFollow={ jest.fn() }
				onUnfollow={ onUnfollow }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /following/i } ) );
		expect( onUnfollow ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'is disabled while isPending and does not trigger handlers', async () => {
		const onFollow = jest.fn();
		const onUnfollow = jest.fn();
		const user = userEvent.setup();
		render(
			<FollowButton
				isFollowing={ false }
				isFollowedBy={ false }
				isPending
				onFollow={ onFollow }
				onUnfollow={ onUnfollow }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /follow/i } ) );
		expect( onFollow ).not.toHaveBeenCalled();
		expect( onUnfollow ).not.toHaveBeenCalled();
	} );
} );
