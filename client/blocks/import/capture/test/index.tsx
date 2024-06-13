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

	it( 'should show no TLD error', async () => {
		const onInputEnter = jest.fn();
		const { getByText } = render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), 'myblog' );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect(
			getByText(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			)
		).toBeInTheDocument();
	} );

	it( 'should show no TLD error for URL with protocol', async () => {
		const onInputEnter = jest.fn();
		const { getByText } = render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), 'https://myblog' );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect(
			getByText(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			)
		).toBeInTheDocument();
	} );
} );

// Helper function to enter URL and click CTA.
const enterUrlAndContinue = async ( url ) => {
	await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), url );
	await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );
};

describe( 'URL Validation', () => {
	beforeEach( () => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);
	} );

	test( 'should show error for missing top-level domain', async () => {
		await enterUrlAndContinue( 'myblog' );

		expect(
			screen.getByText(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			)
		).toBeInTheDocument();
	} );

	test( 'should show error for missing top-level domain event when protocol is present', async () => {
		await enterUrlAndContinue( 'https://myblog' );

		expect(
			screen.getByText(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			)
		).toBeInTheDocument();
	} );

	test( 'should show error for email instead of URL', async () => {
		await enterUrlAndContinue( 'user@example.com' );

		expect(
			screen.getByText(
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).'
			)
		).toBeInTheDocument();
	} );

	test( 'should show error for URL with invalid characters', async () => {
		await enterUrlAndContinue( 'http://my^blog.com' );

		expect(
			screen.getByText(
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com)'
			)
		).toBeInTheDocument();
	} );

	test( 'should show error for invalid protocol', async () => {
		await enterUrlAndContinue( 'ftp://example.com' );

		expect(
			screen.getByText(
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com)'
			)
		).toBeInTheDocument();
	} );

	test( 'should show error for invalid protocol for filepath', async () => {
		await enterUrlAndContinue( 'file:///C:/DEVELOPER/index.html' );

		expect(
			screen.getByText(
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com)'
			)
		).toBeInTheDocument();
	} );

	test( 'should show default error message', async () => {
		await enterUrlAndContinue( 'example.com-' );

		expect(
			screen.getByText(
				'Please enter a valid website address (e.g., example.com). You can copy and paste.'
			)
		).toBeInTheDocument();
	} );
} );
