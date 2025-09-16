/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
} );
