/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import CaptureInput from '../capture-input';

const mockedRecordTracksEvent = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args ) => mockedRecordTracksEvent( ...args ),
} ) );

describe( 'CaptureInput', () => {
	it( 'captures the site url', async () => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://example.wordpress.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.wordpress.com' );
	} );

	it( 'only records invalid urls once', async () => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		// enter an invalid URL
		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), 'not a url' );

		// try to submit the same value twice
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		// enter a value URL and resubmit
		await userEvent.clear( screen.getByLabelText( /Enter the URL of the site/ ) );
		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://example.wordpress.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.wordpress.com' );

		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
	} );
} );
