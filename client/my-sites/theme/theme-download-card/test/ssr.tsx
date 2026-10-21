/**
 * @jest-environment node
 */
import { renderToString } from 'react-dom/server';
import ThemeDownloadCard from '../';

describe( 'ThemeDownloadCard', () => {
	// The theme sheet is server-side rendered; a component that throws in a Node
	// environment silently knocks the whole route back to client rendering.
	test( 'renders on the server', () => {
		const html = renderToString( <ThemeDownloadCard href="https://example.com/theme.zip" /> );

		expect( html ).toContain( 'Download this theme' );
		expect( html ).toContain( 'https://example.com/theme.zip' );
	} );
} );
