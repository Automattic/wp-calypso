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
const mockTrackAddedToPost = jest.fn();
const mockTrackPanelViewed = jest.fn();
const mockFill = jest.fn();
const mockSetCurrentVideoUrl = jest.fn().mockResolvedValue( undefined );
const mockSetCurrentAttachmentId = jest.fn().mockResolvedValue( undefined );
const mockSetCurrentDurationSeconds = jest.fn().mockResolvedValue( undefined );
const mockInsertBlocks = jest.fn();
const mockCreateBlock = jest.fn( ( name: string, attributes: Record< string, unknown > ) => ( {
	name,
	attributes,
} ) );

let mockMeta: Record< string, unknown > = {};
let mockMedia: Record< string, unknown > | null = null;
let mockHasResolvedMedia = true;
let mockHasBlockEditor = true;
let mockReelVisible = false;
let mockGenericVisible = false;
let mockReelIsConfirming = false;
let mockReelIgDisplayName: string | null = null;
const mockReelRequestShare = jest.fn();
const mockReelConfirmShare = jest.fn();
const mockReelCancelShare = jest.fn();
const mockGenericHandleShare = jest.fn();
const mockUseReelShare = jest.fn();
const mockUseGenericShare = jest.fn();

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		className,
		label,
		icon,
	}: {
		children?: React.ReactNode;
		onClick?: () => void;
		className?: string;
		label?: string;
		icon?: React.ReactNode;
	} ) => (
		<button className={ className } aria-label={ label } onClick={ onClick }>
			{ children ?? icon }
		</button>
	),
	// Faithful to real SlotFill semantics: a Fill with no matching Slot
	// mounted (none in jsdom) renders nothing. Recording the name lets us
	// assert the Jetpack-sidebar wiring without duplicating the body in the
	// DOM (which would break every single-match query below).
	Fill: ( { name }: { name: string } ) => {
		mockFill( name );
		return null;
	},
	PanelBody: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	useEntityProp: () => [ mockMeta, jest.fn() ],
} ) );

jest.mock( '@wordpress/blocks', () => ( {
	createBlock: ( name: string, attributes: Record< string, unknown > ) =>
		mockCreateBlock( name, attributes ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( ( store: string ) => {
		if ( store === 'video-studio' ) {
			return {
				setCurrentVideoUrl: mockSetCurrentVideoUrl,
				setCurrentAttachmentId: mockSetCurrentAttachmentId,
				setCurrentDurationSeconds: mockSetCurrentDurationSeconds,
			};
		}
		if ( store === 'core/block-editor' ) {
			return mockHasBlockEditor ? { insertBlocks: mockInsertBlocks } : {};
		}
		return { openImageStudio: mockOpenImageStudio };
	} ),
	useSelect: ( selector: ( s: ( name: string ) => unknown ) => unknown ) => {
		return selector( ( name: string ) => {
			if ( name === 'core/editor' ) {
				return { getCurrentPostType: () => 'post', getCurrentPostId: () => 7 };
			}
			if ( name === 'core' ) {
				return {
					getMedia: () => mockMedia,
					hasFinishedResolution: () => mockHasResolvedMedia,
				};
			}
			return undefined;
		} );
	},
} ) );

// Capture React's useEffect once, at module-load time, bound to the same
// React instance @testing-library/react holds. The suite calls
// jest.resetModules() per test, which would otherwise hand the component a
// freshly-required React whose hook dispatcher react-dom never populates.
const mockUseEffect = jest.requireActual< typeof import('react') >( 'react' ).useEffect;

jest.mock( '@wordpress/element', () => ( {
	useEffect: mockUseEffect,
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

jest.mock( '@wordpress/icons', () => ( {
	share: 'share-icon',
} ) );

jest.mock( '@wordpress/plugins', () => ( {
	registerPlugin: ( name: string, settings: unknown ) => mockRegisterPlugin( name, settings ),
} ) );

jest.mock( 'social-logos', () => ( {
	SocialLogo: ( { icon }: { icon: string } ) => <span data-testid={ `social-${ icon }` } />,
} ) );

jest.mock( '../hooks/use-reel-share', () => ( {
	useReelShare: ( ...args: unknown[] ) => {
		mockUseReelShare( ...args );
		return {
			isVisible: mockReelVisible,
			isSharing: false,
			isConfirming: mockReelIsConfirming,
			igDisplayName: mockReelIgDisplayName,
			requestShare: mockReelRequestShare,
			confirmShare: mockReelConfirmShare,
			cancelShare: mockReelCancelShare,
		};
	},
} ) );

const mockDialogProps = jest.fn();

jest.mock( '../components/reel-share-confirmation-dialog', () => ( {
	ReelShareConfirmationDialog: ( props: Record< string, unknown > ) => {
		mockDialogProps( props );
		return props.isOpen ? <div role="dialog" /> : null;
	},
} ) );

jest.mock( '../hooks/use-generic-share', () => ( {
	useGenericShare: ( ...args: unknown[] ) => {
		mockUseGenericShare( ...args );
		return {
			isVisible: mockGenericVisible,
			isSharing: false,
			handleShare: mockGenericHandleShare,
		};
	},
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
	trackImageStudioFeatureClipAddedToPost: ( ...args: unknown[] ) => mockTrackAddedToPost( ...args ),
	trackImageStudioFeatureClipPanelViewed: ( ...args: unknown[] ) => mockTrackPanelViewed( ...args ),
} ) );

jest.mock( './feature-clip-sidebar.scss', () => ( {} ), { virtual: true } );
jest.mock( '../components/experimental-badge/style.scss', () => ( {} ), { virtual: true } );

describe( 'feature-clip-sidebar-extension', () => {
	beforeEach( () => {
		mockOpenImageStudio.mockClear();
		mockRegisterPlugin.mockClear();
		mockTrackOpened.mockClear();
		mockTrackAddedToPost.mockClear();
		mockTrackPanelViewed.mockClear();
		mockFill.mockClear();
		mockSetCurrentVideoUrl.mockClear();
		mockSetCurrentAttachmentId.mockClear();
		mockSetCurrentDurationSeconds.mockClear();
		mockReelRequestShare.mockClear();
		mockReelConfirmShare.mockClear();
		mockReelCancelShare.mockClear();
		mockGenericHandleShare.mockClear();
		mockUseReelShare.mockClear();
		mockUseGenericShare.mockClear();
		mockDialogProps.mockClear();
		mockInsertBlocks.mockClear();
		mockCreateBlock.mockClear();
		mockMeta = {};
		mockMedia = null;
		mockHasResolvedMedia = true;
		mockHasBlockEditor = true;
		mockReelVisible = false;
		mockGenericVisible = false;
		mockReelIsConfirming = false;
		mockReelIgDisplayName = null;
		( window as Record< string, unknown > ).imageStudioData = { canGenerateVideoClips: true };
		jest.resetModules();
	} );

	afterEach( () => {
		delete ( window as Record< string, unknown > ).imageStudioData;
	} );

	it( 'does not register the plugin when canGenerateVideoClips is false', () => {
		( window as Record< string, unknown > ).imageStudioData = {
			canGenerateVideoClips: false,
		};
		const { registerFeatureClipSidebar } = require( './feature-clip-sidebar-extension' );
		registerFeatureClipSidebar();
		expect( mockRegisterPlugin ).not.toHaveBeenCalled();
	} );

	it( 'does not register the plugin when canGenerateVideoClips is missing', () => {
		( window as Record< string, unknown > ).imageStudioData = {};
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

	describe( 'dual-render (document + Jetpack sidebars)', () => {
		it( 'also fills the Jetpack sidebar SlotFill', () => {
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			// The document-sidebar copy is asserted by every other test; this
			// confirms the second render target — Jetpack's sidebar slot.
			expect( mockFill ).toHaveBeenCalledWith( 'JetpackPluginSidebar' );
		} );

		it( 'fills the Jetpack sidebar regardless of clip state', () => {
			mockMeta = { _jetpack_feature_clip_id: 42 };
			mockMedia = {
				id: 42,
				source_url: 'https://example.com/clip.mp4',
				mime_type: 'video/mp4',
				media_details: { length: 8 },
			};
			mockHasResolvedMedia = true;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( mockFill ).toHaveBeenCalledWith( 'JetpackPluginSidebar' );
		} );

		it( 'fires the panel-viewed impression only once despite dual-render', () => {
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			// Both wrappers share one FeatureClipPanel mount, so the
			// impression must not double-count.
			expect( mockTrackPanelViewed ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'empty state (no clip linked)', () => {
		it( 'renders the Generate clip CTA when meta is empty', () => {
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( screen.getByRole( 'button', { name: 'Generate clip' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Regenerate clip' } ) ).not.toBeInTheDocument();
		} );

		it( 'renders the empty state when meta has an id but the attachment is gone', () => {
			mockMeta = { _jetpack_feature_clip_id: 42 };
			mockMedia = null; // attachment deleted
			mockHasResolvedMedia = true; // resolution finished, attachment confirmed gone
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( screen.getByRole( 'button', { name: 'Generate clip' } ) ).toBeInTheDocument();
		} );

		it( 'holds the panel body blank while the attachment is still resolving', () => {
			mockMeta = { _jetpack_feature_clip_id: 42 };
			mockMedia = null;
			mockHasResolvedMedia = false; // first render — getMedia hasn't completed
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( screen.queryByRole( 'button', { name: 'Generate clip' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Regenerate' } ) ).not.toBeInTheDocument();
		} );

		it( 'opens Image Studio with the post-editor entry point on click', async () => {
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Generate clip' } ) );

			await Promise.resolve();
			await Promise.resolve();

			expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( null );
			expect( mockSetCurrentAttachmentId ).toHaveBeenCalledWith( null );
			expect( mockSetCurrentDurationSeconds ).toHaveBeenCalledWith( null );
			expect( mockTrackOpened ).toHaveBeenCalledWith(
				expect.objectContaining( { entryPoint: 'post_editor_feature_clip', mode: 'generate' } )
			);
			expect( mockOpenImageStudio ).toHaveBeenCalledWith(
				undefined,
				undefined,
				'post_editor_feature_clip'
			);
		} );

		it( 'fires the panel-viewed impression event on mount', () => {
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( mockTrackPanelViewed ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'preview state (clip linked)', () => {
		const setupClip = () => {
			mockMeta = { _jetpack_feature_clip_id: 42 };
			mockMedia = {
				id: 42,
				source_url: 'https://files.wordpress.com/clip.mp4',
				media_details: { length: 8 },
			};
		};

		it( 'renders the video preview and bottom action buttons', () => {
			setupClip();
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			const { container } = render( <FeatureClipPanel /> );

			const video = container.querySelector( 'video' );
			expect( video ).not.toBeNull();
			expect( video?.getAttribute( 'src' ) ).toBe( 'https://files.wordpress.com/clip.mp4' );
			expect( screen.getByRole( 'button', { name: 'Add to post' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Regenerate' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Generate clip' } ) ).not.toBeInTheDocument();
		} );

		it( 'labels both share hooks with the sidebar surface and the meta clip', () => {
			setupClip();
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			expect( mockUseReelShare ).toHaveBeenCalledWith( 'sidebar', {
				url: 'https://files.wordpress.com/clip.mp4',
				attachmentId: 42,
				durationSeconds: 8,
			} );
			expect( mockUseGenericShare ).toHaveBeenCalledWith( 'sidebar', {
				url: 'https://files.wordpress.com/clip.mp4',
				attachmentId: 42,
			} );
		} );

		it( 'hides share buttons when neither hook reports isVisible', () => {
			setupClip();
			mockReelVisible = false;
			mockGenericVisible = false;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect(
				screen.queryByRole( 'button', { name: /Share on Instagram/i } )
			).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /^Share$/i } ) ).not.toBeInTheDocument();
		} );

		it( 'shows both share buttons when both hooks report isVisible', () => {
			setupClip();
			mockReelVisible = true;
			mockGenericVisible = true;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );
			expect( screen.getByRole( 'button', { name: /Share on Instagram/i } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /^Share$/i } ) ).toBeInTheDocument();
		} );

		it( 'invokes requestShare on the IG button and handleShare on the generic button', () => {
			setupClip();
			mockReelVisible = true;
			mockGenericVisible = true;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			fireEvent.click( screen.getByRole( 'button', { name: /Share on Instagram/i } ) );
			expect( mockReelRequestShare ).toHaveBeenCalledTimes( 1 );
			expect( mockReelConfirmShare ).not.toHaveBeenCalled();

			fireEvent.click( screen.getByRole( 'button', { name: /^Share$/i } ) );
			expect( mockGenericHandleShare ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'passes reel state and handlers to the confirmation dialog', () => {
			setupClip();
			mockReelVisible = true;
			mockReelIsConfirming = true;
			mockReelIgDisplayName = 'myhandle';
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			expect( mockDialogProps ).toHaveBeenCalledWith(
				expect.objectContaining( {
					isOpen: true,
					igDisplayName: 'myhandle',
					onConfirm: mockReelConfirmShare,
					onCancel: mockReelCancelShare,
				} )
			);
			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		} );

		it( 'passes isOpen=false to the confirmation dialog when reel.isConfirming is false', () => {
			setupClip();
			mockReelVisible = true;
			mockReelIsConfirming = false;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			expect( mockDialogProps ).toHaveBeenCalledWith(
				expect.objectContaining( { isOpen: false } )
			);
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		it( 'opens Image Studio on Regenerate click', async () => {
			setupClip();
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Regenerate' } ) );
			await Promise.resolve();
			await Promise.resolve();

			expect( mockOpenImageStudio ).toHaveBeenCalledWith(
				undefined,
				undefined,
				'post_editor_feature_clip'
			);
		} );

		it( 'inserts a core/video block and tracks the add-to-post conversion', () => {
			setupClip();
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Add to post' } ) );

			expect( mockCreateBlock ).toHaveBeenCalledWith( 'core/video', {
				id: 42,
				src: 'https://files.wordpress.com/clip.mp4',
			} );
			expect( mockInsertBlocks ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackAddedToPost ).toHaveBeenCalledWith( { attachmentId: 42 } );
		} );

		it( 'does not track add-to-post when the block-editor dispatcher is unavailable', () => {
			setupClip();
			mockHasBlockEditor = false;
			const { FeatureClipPanel } = require( './feature-clip-sidebar-extension' );
			render( <FeatureClipPanel /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Add to post' } ) );

			expect( mockInsertBlocks ).not.toHaveBeenCalled();
			expect( mockTrackAddedToPost ).not.toHaveBeenCalled();
		} );
	} );
} );
