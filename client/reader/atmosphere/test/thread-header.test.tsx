/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThreadHeader } from '../thread-header';
import type { AtmosphereConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const connection: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

describe( 'ThreadHeader', () => {
	let backSpy: jest.SpyInstance;
	let lengthSpy: jest.SpyInstance;

	beforeEach( () => {
		( page as unknown as jest.Mock ).mockReset();
		backSpy = jest.spyOn( window.history, 'back' ).mockImplementation( () => {} );
		// Default to a freshly-loaded-tab state; individual tests override.
		lengthSpy = jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 1 );
	} );

	afterEach( () => {
		backSpy.mockRestore();
		lengthSpy.mockRestore();
	} );

	it( 'renders a Back button', () => {
		render( <ThreadHeader connection={ connection } /> );
		expect( screen.getByRole( 'button', { name: /back/i } ) ).toBeVisible();
	} );

	it( 'falls back to the connection timeline when there is no prior history', async () => {
		const user = userEvent.setup();
		render( <ThreadHeader connection={ connection } /> );
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' );
		expect( backSpy ).not.toHaveBeenCalled();
	} );

	it( 'uses window.history.back() when there is prior in-app history', async () => {
		lengthSpy.mockReturnValue( 5 );
		const user = userEvent.setup();
		render( <ThreadHeader connection={ connection } /> );
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( backSpy ).toHaveBeenCalledTimes( 1 );
		expect( page ).not.toHaveBeenCalled();
	} );

	it( 'invokes onBackToTimeline callback in the deep-link branch', async () => {
		const onBackToTimeline = jest.fn();
		const user = userEvent.setup();
		render( <ThreadHeader connection={ connection } onBackToTimeline={ onBackToTimeline } /> );
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( onBackToTimeline ).toHaveBeenCalledTimes( 1 );
		expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' );
	} );

	it( 'invokes onBackToTimeline callback in the in-app-history branch', async () => {
		lengthSpy.mockReturnValue( 3 );
		const onBackToTimeline = jest.fn();
		const user = userEvent.setup();
		render( <ThreadHeader connection={ connection } onBackToTimeline={ onBackToTimeline } /> );
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( onBackToTimeline ).toHaveBeenCalledTimes( 1 );
		expect( backSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
