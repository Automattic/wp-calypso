/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import LinkPreview from '../link-preview';

// Mock fetch for testing
global.fetch = jest.fn();

// Helper function to create a mock HTML response with OpenGraph tags
const createMockHtml = ( title: string, description: string ) => `
<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="${ title }" />
	<meta property="og:description" content="${ description }" />
	<meta property="og:site_name" content="Test Site" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

describe( 'LinkPreview', () => {
	beforeEach( () => {
		( fetch as jest.Mock ).mockClear();
	} );

	it( 'should decode HTML entities in OpenGraph title and description', async () => {
		const titleWithEntities = 'Test&#8217;s Page &amp; More';
		const descriptionWithEntities = 'A description with &#8220;quotes&#8221; &amp; entities';

		const mockHtml = createMockHtml( titleWithEntities, descriptionWithEntities );

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that HTML entities are properly decoded
			expect( screen.getByText( /Test.*Page.*More/ ) ).toBeInTheDocument();
			expect( screen.getByText( /description.*quotes.*entities/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'should decode HTML entities in fallback title tag', async () => {
		const titleWithEntities = 'Fallback Title with &#8217;s &amp; Entities';

		const mockHtml = `
<!DOCTYPE html>
<html>
<head>
	<title>${ titleWithEntities }</title>
	<meta property="og:description" content="Test description" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that HTML entities in title tag are properly decoded
			expect( screen.getByText( /Fallback.*Title.*Entities/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'should handle common HTML entities correctly', async () => {
		const titleWithCommonEntities = '&lt;Script&gt; &amp; &#39;Quotes&#39; &#8211; Test';

		const mockHtml = createMockHtml( titleWithCommonEntities, 'Simple description' );

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that various HTML entities are properly decoded
			expect( screen.getByText( /Script.*Quotes.*Test/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'should resolve relative URLs for favicons and images', async () => {
		const mockHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="Test Page" />
	<meta property="og:description" content="Test description" />
	<meta property="og:image" content="/images/preview.jpg" />
	<link rel="icon" href="/favicon.ico" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that both favicon and image relative URLs are resolved
			const image = screen.getByRole( 'img', { name: /test page/i } );
			expect( image ).toHaveAttribute( 'src', 'https://example.com/images/preview.jpg' );

			// Find favicon by its CSS class since it might not have alt text
			const favicon = document.querySelector( '.reader-full-post__link-preview-favicon' );
			expect( favicon ).toHaveAttribute( 'src', 'https://example.com/favicon.ico' );
		} );
	} );

	it( 'should handle absolute URLs correctly without modification', async () => {
		const mockHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="Test Page" />
	<meta property="og:image" content="https://cdn.example.com/image.jpg" />
	<link rel="icon" href="https://static.example.com/favicon.ico" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Check that absolute URLs remain unchanged for both images and favicons
			const image = screen.getByRole( 'img', { name: /test page/i } );
			expect( image ).toHaveAttribute( 'src', 'https://cdn.example.com/image.jpg' );

			const favicon = document.querySelector( '.reader-full-post__link-preview-favicon' );
			expect( favicon ).toHaveAttribute( 'src', 'https://static.example.com/favicon.ico' );
		} );
	} );

	it( 'should fallback to Google favicon service when favicon fails to load', async () => {
		const mockHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="Test Page" />
	<meta property="og:description" content="Test description" />
	<link rel="icon" href="/broken-favicon.ico" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

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

			// Should fallback to Google favicon service
			expect( favicon ).toHaveAttribute(
				'src',
				'https://www.google.com/s2/favicons?domain=example.com'
			);
		} );
	} );

	it( 'should prioritize image/x-icon type favicons', async () => {
		const mockHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="Test Page" />
	<meta property="og:description" content="Test description" />
	<link rel="shortcut icon" href="https://example.org/wp-content/themes/theme/assets/img/touch/apple-touch-icon.png" />
	<link href="https://example.org/wp-content/themes/theme/favicon.ico" type="image/x-icon" rel="icon" />
	<link href="https://example.org/wp-content/themes/theme/favicon.ico" type="image/x-icon" rel="shortcut icon" />
</head>
<body>
	<h1>Test Page</h1>
</body>
</html>
`;

		( fetch as jest.Mock ).mockResolvedValueOnce( {
			ok: true,
			text: () => Promise.resolve( mockHtml ),
		} );

		render( <LinkPreview url="https://example.com/test" /> );

		await waitFor( () => {
			// Should pick the image/x-icon type instead of the first favicon found
			const favicon = document.querySelector( '.reader-full-post__link-preview-favicon' );
			expect( favicon ).toHaveAttribute(
				'src',
				'https://example.org/wp-content/themes/theme/favicon.ico'
			);
		} );
	} );
} );
