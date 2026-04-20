/**
 * @jest-environment jsdom
 */

// eslint-disable-next-line import/order
import React from 'react';

// Webpack global injected at build time, used at render time by __().
( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

jest.mock( '@wordpress/block-editor', () => ( {
	useBlockEditContext: jest.fn( () => ( { name: 'core/image' } ) ),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( { children }: { children: React.ReactNode } ) => <button>{ children }</button>,
} ) );

jest.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( fn: ( component: React.ComponentType ) => React.ComponentType ) =>
		fn,
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( () => ( { openImageStudio: jest.fn() } ) ),
} ) );

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { EditorBlock: 'editor-block' },
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Edit: 'edit' },
} ) );

jest.mock( '../utils/get-image-data', () => ( {} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: jest.fn(),
} ) );

jest.mock( './utils', () => ( {
	handleImageSelection: jest.fn(),
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
