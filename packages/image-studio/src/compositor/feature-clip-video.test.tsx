/**
 * @jest-environment jsdom
 */

// EditFrame ships ESM-only with web-component side effects that don't
// matter for our smoke test — we just want to confirm the dispatcher
// resolves the right renderer for each style and renders without throwing.
// `virtual: true` skips Jest's resolver, which doesn't follow the
// workspace-hoisted ESM-only @editframe package.
jest.mock(
	'@editframe/react',
	() => {
		const passthrough = ( name: string ) => {
			const Component = ( {
				children,
				...props
			}: {
				children?: unknown;
				[ key: string ]: unknown;
			} ) => {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const React = require( 'react' );
				return React.createElement( name.toLowerCase(), props, children );
			};
			Component.displayName = name;
			return Component;
		};
		return {
			Image: passthrough( 'EFImage' ),
			Text: passthrough( 'EFText' ),
			Timegroup: passthrough( 'EFTimegroup' ),
		};
	},
	{ virtual: true }
);

// eslint-disable-next-line import/order
import { render } from '@testing-library/react';
// eslint-disable-next-line import/order
import { FeatureClipVideo } from './feature-clip-video';
// eslint-disable-next-line import/order
import type { FeatureClipBrief } from './types';

const baseBrief: FeatureClipBrief = {
	style: 'highlights',
	scenes: [
		{ imageUrl: 'https://example.com/a.jpg', camera: 'zoom-in', caption: 'Morning light' },
		{ imageUrl: 'https://example.com/b.jpg', camera: 'pan-right' },
	],
	titleCard: { copy: 'A short story' },
};

describe( 'FeatureClipVideo dispatcher', () => {
	it( 'renders the highlights variant', () => {
		expect( () => render( <FeatureClipVideo brief={ baseBrief } /> ) ).not.toThrow();
	} );

	it( 'tolerates an empty scene list', () => {
		const empty: FeatureClipBrief = { ...baseBrief, scenes: [] };
		expect( () => render( <FeatureClipVideo brief={ empty } /> ) ).not.toThrow();
	} );

	it( 'tolerates a missing audioBed (defaults to silent)', () => {
		const noAudio: FeatureClipBrief = { ...baseBrief };
		delete ( noAudio as Partial< FeatureClipBrief > ).audioBed;
		expect( () => render( <FeatureClipVideo brief={ noAudio } /> ) ).not.toThrow();
	} );
} );
