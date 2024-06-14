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
	beforeEach( () => jest.resetAllMocks() );

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

	it( 'shows an custom input label', async () => {
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ jest.fn() } label="A custom label text" />
			</MemoryRouter>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( screen.getByLabelText( /A custom label text/ ) ).toBeInTheDocument();
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

		// Now, enter a valid URL and confirm we can submit ok
		await userEvent.clear( screen.getByLabelText( /Enter the URL of the site/ ) );
		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://example.wordpress.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.wordpress.com' );

		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
	} );

	it( 'shows a custom CTA label', async () => {
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ jest.fn() } label="A custom label text" nextLabelText="XYZ" />
			</MemoryRouter>
		);

		expect( screen.getByRole( 'button', { name: /XYZ/ } ) ).toBeInTheDocument();
	} );
} );

describe( 'URL Validation', () => {
	it.each( [
		{
			input: 'myblog',
			error:
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com',
		},
		{
			input: 'https://myblog',
			error:
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com',
		},
		{
			input: 'user@example.com',
			error:
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).',
		},
		{
			input: 'http://my^blog.com',
			error:
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com).',
		},
		{
			input: 'ftp://example.com',
			error:
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com).',
		},
		{
			input: 'file:///C:/DEVELOPER/index.html',
			error:
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com).',
		},
		{
			input: 'https://xn--example.com',
			error:
				'Looks like you’ve entered an internationalized domain name (IDN). Please enter a standard URL instead (e.g., example.com).',
		},
		{
			input: 'www.例子.测试',
			error:
				'Looks like you’ve entered an internationalized domain name (IDN). Please enter a standard URL instead (e.g., example.com).',
		},
		{
			input: 'example.com-',
			error: 'Please enter a valid website address (e.g., example.com). You can copy and paste.',
		},
	] )( 'shows error message "$error" when input URL is "$input"', async ( { input, error } ) => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), input );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( screen.getByText( error ) ).toBeInTheDocument();
	} );
} );
