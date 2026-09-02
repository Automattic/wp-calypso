/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFollowButton } from '../follow-tag-button';

describe( 'TagFollowButton', () => {
	it( 'shows the follow label and fires onToggle when not following', async () => {
		const user = userEvent.setup();
		const onToggle = jest.fn();
		render( <TagFollowButton following={ false } onToggle={ onToggle } /> );

		const button = screen.getByRole( 'button', { name: 'Follow' } );
		expect( button ).toBeVisible();

		await user.click( button );
		expect( onToggle ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows the following label when following', () => {
		render( <TagFollowButton following onToggle={ jest.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Following' } ) ).toBeVisible();
	} );

	it( 'is disabled while a request is in flight', () => {
		render( <TagFollowButton following={ false } disabled onToggle={ jest.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Follow' } ) ).toBeDisabled();
	} );

	it( 'labels the button with the tag name for the tooltip', () => {
		render( <TagFollowButton following={ false } tagName="Finance" onToggle={ jest.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Follow the “Finance” tag' } ) ).toBeVisible();
	} );
} );
