/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EarlyReadersModal } from '../index';

const defaultProps = {
	hasSite: true,
	hasJoined: false,
	onDecline: jest.fn(),
	onJoin: jest.fn(),
	onFinish: jest.fn(),
};

const renderModal = ( props: Partial< React.ComponentProps< typeof EarlyReadersModal > > = {} ) =>
	render( <EarlyReadersModal { ...defaultProps } { ...props } /> );

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'EarlyReadersModal – the offer', () => {
	it( 'renders the opt-in intro, the deal, and the topic picker', () => {
		renderModal();

		expect( screen.getByRole( 'heading', { name: 'Get your first readers' } ) ).toBeVisible();
		expect( screen.getByText( 'What you get' ) ).toBeVisible();
		expect( screen.getByText( 'What you agree to' ) ).toBeVisible();
		expect( screen.getByRole( 'group', { name: 'Choose a topic' } ) ).toBeVisible();
	} );

	it( 'shows the has-site copy variant when the user has a site', () => {
		renderModal( { hasSite: true } );

		expect(
			screen.getByText(
				'We’ll put you in a group with four other people starting a blog this week, and you’ll read each other’s first posts.'
			)
		).toBeVisible();
	} );

	it( 'shows the no-site copy variant when the user has no site', () => {
		renderModal( { hasSite: false } );

		expect(
			screen.getByText(
				'Publish your first post and we’ll put you in a group with four other new writers, so you have readers waiting when you do.'
			)
		).toBeVisible();
	} );

	it( 'calls onDecline when "No thanks" is clicked', async () => {
		const user = userEvent.setup();
		renderModal();

		await user.click( screen.getByRole( 'button', { name: 'No thanks' } ) );

		expect( defaultProps.onDecline ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables Join until an interest is selected', async () => {
		const user = userEvent.setup();
		renderModal();

		expect( screen.getByRole( 'button', { name: 'Join Early Readers' } ) ).toBeDisabled();

		await user.click( screen.getByRole( 'button', { name: /Travel/ } ) );

		expect( screen.getByRole( 'button', { name: /Travel/ } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByRole( 'button', { name: 'Join Early Readers' } ) ).toBeEnabled();
	} );

	it( 'selects only one interest at a time', async () => {
		const user = userEvent.setup();
		renderModal();

		await user.click( screen.getByRole( 'button', { name: /Travel/ } ) );
		await user.click( screen.getByRole( 'button', { name: /Food & drink/ } ) );

		expect( screen.getByRole( 'button', { name: /Travel/ } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
		expect( screen.getByRole( 'button', { name: /Food & drink/ } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'reports the selected interest slug via onJoin', async () => {
		const user = userEvent.setup();
		renderModal();

		await user.click( screen.getByRole( 'button', { name: /Photography & art/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Join Early Readers' } ) );

		expect( defaultProps.onJoin ).toHaveBeenCalledWith( 'photography-arts' );
	} );

	it( 'does not call onJoin when no interest is selected', async () => {
		const user = userEvent.setup();
		renderModal();

		// The button is disabled, so this click is a no-op — but assert the
		// handler's own guard too, since a future layout change could re-enable
		// the button before an interest exists.
		await user.click( screen.getByRole( 'button', { name: 'Join Early Readers' } ) );

		expect( defaultProps.onJoin ).not.toHaveBeenCalled();
	} );
} );

describe( 'EarlyReadersModal – the confirmation', () => {
	it( 'replaces the offer with the confirmation once joined', () => {
		renderModal( { hasJoined: true } );

		expect( screen.getByRole( 'heading', { name: 'You’re in' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Get your first readers' } )
		).not.toBeInTheDocument();
		expect( screen.queryByText( 'What you get' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'group', { name: 'Choose a topic' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'No thanks' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Join Early Readers' } )
		).not.toBeInTheDocument();
	} );

	it( 'calls onFinish from the "Back to Reader" button', async () => {
		const user = userEvent.setup();
		renderModal( { hasJoined: true } );

		await user.click( screen.getByRole( 'button', { name: 'Back to Reader' } ) );

		expect( defaultProps.onFinish ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows the has-site next steps', () => {
		renderModal( { hasSite: true, hasJoined: true } );

		expect(
			screen.getByText( 'We match you with four other new writers in your topic.' )
		).toBeVisible();
		expect( screen.getByText( 'They do the same for your post.' ) ).toBeVisible();
	} );

	it( 'shows the no-site next steps', () => {
		renderModal( { hasSite: false, hasJoined: true } );

		expect( screen.getByText( 'Publish your first post whenever you’re ready.' ) ).toBeVisible();
		expect(
			screen.getByText(
				'We’ll email you once you publish your first post and your group is ready.'
			)
		).toBeVisible();
	} );
} );
