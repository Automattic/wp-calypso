/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import LinkPreview from '../link-preview';

// Mock wpcom
jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );
const mockWpcomGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;

// Helper function to create mock API response data
const createMockApiResponse = ( title: string, description: string, additionalData = {} ) => ( {
	title,
	description,
	favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=48',
	site_name: 'Test Site',
	domain: 'example.com',
	url: 'https://example.com/test',
	...additionalData,
} );

describe( 'LinkPreview', () => {
	beforeEach( () => {
		mockWpcomGet.mockClear();
		mockWpcomGet.mockReset();
	} );

	it( 'should render nothing when API call fails', async () => {
		mockWpcomGet.mockRejectedValue( new Error( 'API error' ) );

		const { container } = render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			expect( container.firstChild ).toBeNull();
		} );
	} );

	it( 'should render preview when API returns valid data', async () => {
		const mockData = createMockApiResponse( 'Test Title', 'Test description' );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			expect( screen.getByText( 'Test Title' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test description' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Site' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should handle API response with entities already decoded', async () => {
		const mockData = createMockApiResponse(
			"Test's Page & More",
			'A description with "quotes" & entities'
		);
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			expect( screen.getByText( "Test's Page & More" ) ).toBeInTheDocument();
			expect( screen.getByText( 'A description with "quotes" & entities' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should display images and favicons from API response', async () => {
		const mockData = createMockApiResponse( 'Test Page', 'Test description', {
			image: 'https://example.com/images/preview.jpg',
			favicon: 'https://example.com/favicon.ico',
			image_alt: 'Test image alt text',
		} );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			const image = screen.getByRole( 'img', { name: /test image alt text/i } );
			expect( image ).toHaveAttribute( 'src', 'https://example.com/images/preview.jpg' );

			const favicon = document.querySelector( '.reader-full-post__link-preview-favicon' );
			expect( favicon ).toHaveAttribute( 'src', 'https://example.com/favicon.ico' );
		} );
	} );

	it( 'should hide favicon when it fails to load', async () => {
		const mockData = createMockApiResponse( 'Test Page', 'Test description', {
			favicon: 'https://example.com/broken-favicon.ico',
		} );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			const favicon = document.querySelector(
				'.reader-full-post__link-preview-favicon'
			) as HTMLImageElement;
			expect( favicon ).toHaveAttribute( 'src', 'https://example.com/broken-favicon.ico' );

			// Simulate favicon load error by firing the error event
			const errorEvent = new Event( 'error' );
			Object.defineProperty( errorEvent, 'target', { value: favicon, enumerable: true } );
			favicon.dispatchEvent( errorEvent );

			// Should be hidden when it fails to load
			expect( favicon ).toHaveStyle( 'display: none' );
		} );
	} );

	it( 'should display published time when available', async () => {
		const publishedTime = '2023-12-01T10:00:00Z';
		const mockData = createMockApiResponse( 'Test Page', 'Test description', {
			published_time: publishedTime,
		} );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that relative time is displayed (exact text depends on current date)
			const dateElement = document.querySelector( '.reader-full-post__link-preview-date' );
			expect( dateElement ).toBeInTheDocument();
		} );
	} );

	it( 'should use site_name from API response', async () => {
		const mockData = createMockApiResponse( 'Test Page', 'Test description', {
			site_name: 'Custom Site Name',
		} );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			expect( screen.getByText( 'Custom Site Name' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should call wpcom API with correct parameters', async () => {
		const mockData = createMockApiResponse( 'Test Title', 'Test description' );
		mockWpcomGet.mockResolvedValue( mockData );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			expect( mockWpcomGet ).toHaveBeenCalledWith(
				{
					path: '/read/link-preview',
					apiNamespace: 'wpcom/v2',
				},
				{ url: 'https://example.com/test' }
			);
		} );
	} );
} );
