// eslint-disable-next-line import/no-nodejs-modules
import { readFileSync } from 'node:fs';
// eslint-disable-next-line import/no-nodejs-modules
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { expect, it } from 'vitest';
import { processMarkdownExtensions } from '.';

// Safari before 16.4 can't parse a lookbehind, and a regex literal it can't parse stops the whole
// chunk from loading. The root `resolutions` pin this package to a version without one.
it( 'uses a GFM autolink package without regex lookbehinds', () => {
	const entry = createRequire( import.meta.url ).resolve( 'mdast-util-gfm-autolink-literal' );
	const source = readFileSync( entry.replace( /index\.js$/, 'lib/index.js' ), 'utf8' );

	expect( source ).not.toMatch( /\(\?<[=!]/ );
} );

it( 'still links bare URLs and email addresses', () => {
	const { remarkPlugins } = processMarkdownExtensions( { gfm: { enabled: true } } );
	const html = renderToStaticMarkup(
		<ReactMarkdown remarkPlugins={ remarkPlugins }>
			Visit www.example.com or write to (hello@example.com), not a/b@example.com.
		</ReactMarkdown>
	);

	expect( html ).toContain( '<a href="http://www.example.com">www.example.com</a>' );
	expect( html ).toContain( '<a href="mailto:hello@example.com">hello@example.com</a>' );
	expect( html ).not.toContain( 'mailto:b@example.com' );
} );
