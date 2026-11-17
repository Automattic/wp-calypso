/* eslint-disable import/order */
import React from 'react';
import { vi } from 'vitest';

// Webpack global injected at build time, used at render time by __().
( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

vi.mock( '@wordpress/block-editor', () => ( {
	useBlockEditContext: vi.fn( () => ( { name: 'core/image' } ) ),
} ) );

vi.mock( '@wordpress/components', () => ( {
	Button: ( { children }: { children: React.ReactNode } ) => <button>{ children }</button>,
} ) );

vi.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( fn: ( component: React.ComponentType ) => React.ComponentType ) =>
		fn,
} ) );

vi.mock( '@wordpress/data', () => ( {
	dispatch: vi.fn( () => ( { openImageStudio: vi.fn() } ) ),
} ) );

vi.mock( '@wordpress/element', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/element' ) >( '@wordpress/element' ) ),
} ) );

vi.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

vi.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { EditorBlock: 'editor-block' },
} ) );

vi.mock( '../types', () => ( {
	ImageStudioMode: { Edit: 'edit' },
} ) );

vi.mock( '../utils/get-image-data', () => ( {} ) );

vi.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: vi.fn(),
} ) );

vi.mock( './utils', () => ( {
	handleImageSelection: vi.fn(),
} ) );

// Must import after jest.mock() calls to receive the mocked dependencies.
import { withImageStudioGenerateButton } from './generate-button-extension';

describe( 'withImageStudioGenerateButton', () => {
	it( 'should return a component compatible with class extends', () => {
		const OriginalComponent = () => <div />;
		const Wrapped = withImageStudioGenerateButton( OriginalComponent );

		// This must not throw — AMP and similar plugins use `class extends`
		// on the editor.MediaUpload filter result.
		expect( () => {
			class TestExtend extends ( Wrapped as any ) {}
			return TestExtend;
		} ).not.toThrow();
	} );
} );
