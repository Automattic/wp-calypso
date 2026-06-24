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
		// Visual label is "Following" but the accessible name describes the
		// action so SR/touch-AT users hear what activation does. Both labels
		// (default + hover) are rendered with aria-hidden, so the only
		// queryable name is the aria-label.
		await user.click( screen.getByRole( 'button', { name: /^unfollow$/i } ) );
		expect( onUnfollow ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'includes the actor handle in the unfollow accessible name when supplied', () => {
		render(
			<FollowButton
				isFollowing
				isFollowedBy={ false }
				actorHandle="alice.bsky.social"
				onFollow={ jest.fn() }
				onUnfollow={ jest.fn() }
			/>
		);
		expect(
			screen.getByRole( 'button', { name: /unfollow @alice\.bsky\.social/i } )
		).toBeVisible();
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

	describe( 'isRequested state', () => {
		it( 'renders "Requested" label and "Cancel request" hover label when isRequested is true and isFollowing is false', () => {
			render(
				<FollowButton
					isFollowing={ false }
					isFollowedBy={ false }
					isRequested
					actorHandle="alice@mastodon.social"
					onFollow={ jest.fn() }
					onUnfollow={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'Requested' ) ).toBeVisible();
			expect( screen.getByText( 'Cancel request' ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', {
					name: 'Cancel follow request to @alice@mastodon.social',
				} )
			).toBeVisible();
		} );

		it( 'falls back to a generic aria-label when actorHandle is not supplied', () => {
			render(
				<FollowButton
					isFollowing={ false }
					isFollowedBy={ false }
					isRequested
					onFollow={ jest.fn() }
					onUnfollow={ jest.fn() }
				/>
			);

			expect( screen.getByRole( 'button', { name: 'Cancel follow request' } ) ).toBeVisible();
		} );

		it( 'invokes onUnfollow when the Requested button is clicked', async () => {
			const user = userEvent.setup();
			const onUnfollow = jest.fn();
			render(
				<FollowButton
					isFollowing={ false }
					isFollowedBy={ false }
					isRequested
					onFollow={ jest.fn() }
					onUnfollow={ onUnfollow }
				/>
			);

			await user.click( screen.getByRole( 'button' ) );

			expect( onUnfollow ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'disables the Requested button while isPending and does not invoke onUnfollow', async () => {
			const user = userEvent.setup();
			const onUnfollow = jest.fn();
			render(
				<FollowButton
					isFollowing={ false }
					isFollowedBy={ false }
					isRequested
					isPending
					actorHandle="alice@mastodon.social"
					onFollow={ jest.fn() }
					onUnfollow={ onUnfollow }
				/>
			);

			const button = screen.getByRole( 'button' );
			expect( button ).toBeDisabled();
			await user.click( button );
			expect( onUnfollow ).not.toHaveBeenCalled();
		} );

		it( 'isFollowing wins over isRequested when both are true (defensive precedence)', () => {
			render(
				<FollowButton
					isFollowing
					isFollowedBy={ false }
					isRequested
					actorHandle="alice@mastodon.social"
					onFollow={ jest.fn() }
					onUnfollow={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'Following' ) ).toBeVisible();
			expect( screen.queryByText( 'Requested' ) ).not.toBeInTheDocument();
		} );

		it( 'isRequested wins over isFollowedBy when both are true', () => {
			// Locked-account viewer who is also followed by the target:
			// the pending follow request must visually trump the
			// "Follow back" affordance so the wire state is honoured.
			render(
				<FollowButton
					isFollowing={ false }
					isFollowedBy
					isRequested
					actorHandle="alice@mastodon.social"
					onFollow={ jest.fn() }
					onUnfollow={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'Requested' ) ).toBeVisible();
			expect( screen.queryByText( 'Follow back' ) ).not.toBeInTheDocument();
		} );
	} );
} );
