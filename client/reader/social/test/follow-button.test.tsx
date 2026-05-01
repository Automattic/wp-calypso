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
		const button = screen.getByRole( 'button', { name: /follow/i } );
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
} );
