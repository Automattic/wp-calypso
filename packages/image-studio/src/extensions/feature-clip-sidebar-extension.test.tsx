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
const mockSetCurrentVideoUrl = jest.fn().mockResolvedValue( undefined );
const mockSetCurrentAttachmentId = jest.fn().mockResolvedValue( undefined );
const mockSetCurrentDurationSeconds = jest.fn().mockResolvedValue( undefined );

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
	dispatch: jest.fn( ( store: string ) => {
		if ( store === 'video-studio' ) {
			return {
				setCurrentVideoUrl: mockSetCurrentVideoUrl,
				setCurrentAttachmentId: mockSetCurrentAttachmentId,
				setCurrentDurationSeconds: mockSetCurrentDurationSeconds,
				setFeatureClipIsCancelling: jest.fn(),
				clearFeatureClipPending: jest.fn(),
			};
		}
		return { openImageStudio: mockOpenImageStudio };
	} ),
	useDispatch: () => ( {
		setFeatureClipProgressPhase: jest.fn(),
		completeFeatureClipRender: jest.fn(),
		failFeatureClipRender: jest.fn(),
		clearFeatureClipPending: jest.fn(),
	} ),
	useSelect: ( cb: ( s: ( name: string ) => unknown ) => unknown ) =>
		cb( () => ( {
			getPendingFeatureClipRender: () => null,
			getCurrentVideoUrl: () => null,
			getCurrentAttachmentId: () => null,
			getCurrentDurationSeconds: () => null,
			getFeatureClipProgressPhase: () => 'idle',
			getFeatureClipIsCancelling: () => false,
		} ) ),
	subscribe: () => () => undefined,
} ) );

jest.mock(
	'@editframe/react',
	() => ( {
		Configuration: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
		Preview: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
		TimelineRoot: () => null,
	} ),
	{ virtual: true }
);

jest.mock( '../compositor/feature-clip-render-host', () => ( {
	FeatureClipRenderHost: () => <div data-testid="feature-clip-render-host" />,
} ) );

jest.mock( './feature-clip-progress', () => ( {
	FeatureClipProgress: () => <div data-testid="feature-clip-progress" />,
} ) );

jest.mock( './feature-clip-result', () => ( {
	FeatureClipResult: () => <div data-testid="feature-clip-result" />,
} ) );

jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( ( name: string, attrs: Record< string, unknown > ) => ( {
		name,
		attributes: attrs,
	} ) ),
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

jest.mock( '../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: ( ...args: unknown[] ) => mockTrackOpened( ...args ),
} ) );

jest.mock( './feature-clip-sidebar.scss', () => ( {} ), { virtual: true } );
jest.mock( '../components/experimental-badge/style.scss', () => ( {} ), { virtual: true } );

describe( 'feature-clip-sidebar-extension', () => {
	beforeEach( () => {
		mockOpenImageStudio.mockClear();
		mockRegisterPlugin.mockClear();
		mockTrackOpened.mockClear();
		mockSetCurrentVideoUrl.mockClear();
		mockSetCurrentAttachmentId.mockClear();
		mockSetCurrentDurationSeconds.mockClear();
		( window as Record< string, unknown > ).imageStudioData = { isDevMode: true };
		jest.resetModules();
	} );

	afterEach( () => {
		delete ( window as Record< string, unknown > ).imageStudioData;
	} );

	it( 'does not register the plugin when isDevMode is false', () => {
		( window as Record< string, unknown > ).imageStudioData = { isDevMode: false };
		const { registerFeatureClipSidebar } = require( './feature-clip-sidebar-extension' );
		registerFeatureClipSidebar();
		expect( mockRegisterPlugin ).not.toHaveBeenCalled();
	} );

	it( 'does not register the plugin when canGenerateVideoClips is false', () => {
		( window as Record< string, unknown > ).imageStudioData = {
			isDevMode: true,
			canGenerateVideoClips: false,
		};
		const { registerFeatureClipSidebar } = require( './feature-clip-sidebar-extension' );
		registerFeatureClipSidebar();
		expect( mockRegisterPlugin ).not.toHaveBeenCalled();
	} );

	it( 'registers a sidebar plugin exactly once', () => {
		const { registerFeatureClipSidebar } = require( './feature-clip-sidebar-extension' );
		registerFeatureClipSidebar();
		registerFeatureClipSidebar();
		registerFeatureClipSidebar();

		expect( mockRegisterPlugin ).toHaveBeenCalledTimes( 1 );
		expect( mockRegisterPlugin.mock.calls[ 0 ][ 0 ] ).toBe( 'image-studio-feature-clip' );
	} );

	it( 'opens Image Studio with the post-editor entry point on click', async () => {
		const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
		render( <FeatureClipPanel /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Generate clip' } ) );

		// handleClick awaits the video-studio reset before opening the modal,
		// so flush microtasks before asserting on the post-await calls.
		await Promise.resolve();
		await Promise.resolve();

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( null );
		expect( mockSetCurrentAttachmentId ).toHaveBeenCalledWith( null );
		expect( mockSetCurrentDurationSeconds ).toHaveBeenCalledWith( null );
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
