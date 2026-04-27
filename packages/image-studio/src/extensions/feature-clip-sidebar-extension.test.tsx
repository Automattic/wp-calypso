/**
 * @jest-environment jsdom
 */

// eslint-disable-next-line import/order
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

const mockOpenImageStudio = jest.fn();
const mockRegisterPlugin = jest.fn();
const mockTrackOpened = jest.fn();

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		className,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		className?: string;
	} ) => (
		<button className={ className } onClick={ onClick }>
			{ children }
		</button>
	),
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( () => ( { openImageStudio: mockOpenImageStudio } ) ),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	PluginDocumentSettingPanel: ( {
		children,
		title,
	}: {
		children: React.ReactNode;
		title: string;
	} ) => <section aria-label={ title }>{ children }</section>,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '@wordpress/plugins', () => ( {
	registerPlugin: ( name: string, settings: unknown ) => mockRegisterPlugin( name, settings ),
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: { PostEditorFeatureClip: 'post_editor_feature_clip' },
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: ( ...args: unknown[] ) => mockTrackOpened( ...args ),
} ) );

jest.mock( './feature-clip-sidebar.scss', () => ( {} ), { virtual: true } );

describe( 'feature-clip-sidebar-extension', () => {
	beforeEach( () => {
		mockOpenImageStudio.mockClear();
		mockRegisterPlugin.mockClear();
		mockTrackOpened.mockClear();
		jest.resetModules();
	} );

	it( 'registers a sidebar plugin exactly once', () => {
		const { registerFeatureClipSidebar } = require( './feature-clip-sidebar-extension' );
		registerFeatureClipSidebar();
		registerFeatureClipSidebar();
		registerFeatureClipSidebar();

		expect( mockRegisterPlugin ).toHaveBeenCalledTimes( 1 );
		expect( mockRegisterPlugin.mock.calls[ 0 ][ 0 ] ).toBe( 'big-sky-feature-clip' );
	} );

	it( 'opens Image Studio with the post-editor entry point on click', () => {
		const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
		render( <FeatureClipPanel /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Generate clip' } ) );

		expect( mockTrackOpened ).toHaveBeenCalledWith(
			expect.objectContaining( { entryPoint: 'post_editor_feature_clip' } )
		);
		expect( mockOpenImageStudio ).toHaveBeenCalledWith(
			undefined,
			undefined,
			'post_editor_feature_clip'
		);
	} );
} );
