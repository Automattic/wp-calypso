/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Dual-rendered, mirroring Jetpack SEO's pattern: the same body renders into
 * BOTH the default WordPress document sidebar (via `PluginDocumentSettingPanel`
 * from `@wordpress/editor`) AND the Jetpack sidebar (via a `Fill` into
 * Jetpack's `"JetpackPluginSidebar"` SlotFill). The Fill is inert when the
 * Jetpack editor bundle isn't loaded, so the document-sidebar copy always
 * shows and the Jetpack-sidebar copy is purely additive.
 *
 * When no clip is linked to the post, shows a short description + Generate
 * clip button. Once a clip exists (via the `_jetpack_feature_clip_id` post
 * meta registered by Jetpack's Image Studio extension), shows a small video
 * preview, a share row mirroring the modal, and a Regenerate button.
 */
import { createBlock } from '@wordpress/blocks';
import { Button, Fill, PanelBody } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { dispatch, useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { share } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import { SocialLogo } from 'social-logos';
import { ExperimentalBadge } from '../components/experimental-badge';
import { ReelShareConfirmationDialog } from '../components/reel-share-confirmation-dialog';
import { useGenericShare } from '../hooks/use-generic-share';
import { useReelShare } from '../hooks/use-reel-share';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import {
	trackImageStudioFeatureClipAddedToPost,
	trackImageStudioFeatureClipPanelViewed,
	trackImageStudioOpened,
} from '../utils/tracking';
import { FEATURE_CLIP_META_KEY } from './feature-clip-meta';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';

interface MediaRecord {
	id: number;
	source_url?: string;
	mime_type?: string;
	media_details?: { length?: number };
}

async function openImageStudioForFeatureClip(): Promise< void > {
	const { openImageStudio } = dispatch( imageStudioStore );
	const { setCurrentVideoUrl, setCurrentAttachmentId, setCurrentDurationSeconds } = dispatch(
		videoStudioStore
	) as VideoStudioActions;
	// Reset the modal-session store BEFORE opening the modal — these actions
	// are promisified by wp-data, so a fire-and-forget here would let the modal
	// mount with the previous clip's URL/attachmentId still in the store and
	// flash the old preview for one render.
	await Promise.all( [
		setCurrentVideoUrl( null ),
		setCurrentAttachmentId( null ),
		setCurrentDurationSeconds( null ),
	] );

	trackImageStudioOpened( {
		mode: ImageStudioMode.Generate,
		entryPoint: ImageStudioEntryPoint.PostEditorFeatureClip,
	} );

	openImageStudio( undefined, undefined, ImageStudioEntryPoint.PostEditorFeatureClip );
}

interface FeatureClipPreviewProps {
	videoUrl: string;
	attachmentId: number;
	durationSeconds: number | null;
}

function FeatureClipPreview( {
	videoUrl,
	attachmentId,
	durationSeconds,
}: FeatureClipPreviewProps ): JSX.Element {
	const reel = useReelShare( 'sidebar', { url: videoUrl, attachmentId, durationSeconds } );
	const generic = useGenericShare( 'sidebar', { url: videoUrl, attachmentId } );

	const reelLabel = reel.isSharing
		? __( 'Sharing on Instagram…', __i18n_text_domain__ )
		: __( 'Share on Instagram', __i18n_text_domain__ );

	const genericLabel = generic.isSharing
		? __( 'Sharing…', __i18n_text_domain__ )
		: __( 'Share', __i18n_text_domain__ );

	const handleAddToPost = () => {
		const { insertBlocks } = dispatch( 'core/block-editor' ) as {
			insertBlocks?: ( blocks: unknown ) => void;
		};
		// Bail before tracking if the block-editor dispatcher is unavailable —
		// recording the conversion when no block was inserted would log a
		// phantom add-to-post.
		if ( ! insertBlocks ) {
			return;
		}
		insertBlocks( createBlock( 'core/video', { id: attachmentId, src: videoUrl } ) );
		trackImageStudioFeatureClipAddedToPost( { attachmentId } );
	};

	return (
		<>
			<div className="image-studio-feature-clip-panel__preview-frame">
				<video
					className="image-studio-feature-clip-panel__preview-video"
					src={ videoUrl }
					aria-label={ __( 'Feature clip preview', __i18n_text_domain__ ) }
					controls
					loop
					muted
					playsInline
					preload="metadata"
				/>
			</div>
			{ generic.isVisible && (
				<Button
					variant="primary"
					icon={ share }
					className="image-studio-feature-clip-panel__share-cta"
					__next40pxDefaultSize
					disabled={ generic.isSharing }
					isBusy={ generic.isSharing }
					onClick={ generic.handleShare }
				>
					{ genericLabel }
				</Button>
			) }
			{ reel.isVisible && (
				<Button
					variant={ generic.isVisible ? 'secondary' : 'primary' }
					icon={ <SocialLogo icon="instagram" size={ 18 } /> }
					className="image-studio-feature-clip-panel__share-cta"
					__next40pxDefaultSize
					disabled={ reel.isSharing }
					isBusy={ reel.isSharing }
					onClick={ reel.requestShare }
				>
					{ reelLabel }
				</Button>
			) }
			<ReelShareConfirmationDialog
				isOpen={ reel.isConfirming }
				igDisplayName={ reel.igDisplayName }
				onConfirm={ reel.confirmShare }
				onCancel={ reel.cancelShare }
			/>
			<div className="image-studio-feature-clip-panel__bottom-actions">
				<Button
					variant="secondary"
					className="image-studio-feature-clip-panel__bottom-action"
					__next40pxDefaultSize
					onClick={ handleAddToPost }
				>
					{ __( 'Add to post', __i18n_text_domain__ ) }
				</Button>
				<Button
					variant="secondary"
					className="image-studio-feature-clip-panel__bottom-action"
					__next40pxDefaultSize
					onClick={ openImageStudioForFeatureClip }
				>
					{ __( 'Regenerate', __i18n_text_domain__ ) }
				</Button>
			</div>
		</>
	);
}

function FeatureClipEmptyState(): JSX.Element {
	return (
		<>
			<p className="image-studio-feature-clip-panel__description">
				{ __(
					'Turn this post into a short vertical video. Powered by your site guidelines.',
					__i18n_text_domain__
				) }
			</p>
			<Button
				variant="secondary"
				className="image-studio-feature-clip-panel__cta"
				__next40pxDefaultSize
				onClick={ openImageStudioForFeatureClip }
			>
				{ __( 'Generate clip', __i18n_text_domain__ ) }
			</Button>
		</>
	);
}

/**
 * Post types the Feature Clip panel is offered on. Mirrors the backend, which
 * registers the `_jetpack_feature_clip_id` meta for `post` only (see Jetpack's
 * `register_feature_clip_post_meta` in image-studio.php — "pages can be added
 * later"). The plugin is registered globally, so its render runs in EVERY
 * block editor, including the standalone Jetpack Form editor
 * (`post_type=jetpack_form`), where turning the post into a video makes no
 * sense and the meta isn't even registered. The post-type gate lives in the
 * panel render rather than at registration because registration happens once,
 * up front, before the editor's current post type is known.
 */
const SUPPORTED_POST_TYPES = [ 'post' ];

function FeatureClipPanel(): JSX.Element | null {
	const { postType, postId } = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as
			| {
					getCurrentPostType: () => string | null;
					getCurrentPostId: () => number | null;
			  }
			| undefined;
		return {
			// Leave this null when the editor store is absent or the post type
			// hasn't loaded yet — do NOT fall back to 'post'. A 'post' fallback
			// would pass the gate below for an unknown type and flash the panel
			// (plus fire a phantom impression) until the real type resolves.
			postType: editor?.getCurrentPostType?.() ?? null,
			postId: editor?.getCurrentPostId?.() ?? null,
		};
	}, [] );

	// Bail until the post type is both known and supported, before any of the
	// body's hooks run — so the panel never mounts (and never fires a phantom
	// panel-viewed impression) on editors like the Jetpack Form editor, nor in
	// the transient window before the current post type is available.
	if ( ! postType || ! SUPPORTED_POST_TYPES.includes( postType ) ) {
		return null;
	}

	return <FeatureClipPanelBody postType={ postType } postId={ postId } />;
}

interface FeatureClipPanelBodyProps {
	postType: string;
	postId: number | null;
}

function FeatureClipPanelBody( { postType, postId }: FeatureClipPanelBodyProps ): JSX.Element {
	// Pass the post ID explicitly. Without it `useEntityProp` falls back to
	// EntityProvider context, which isn't set up for sidebar surfaces in every
	// editor — meta would silently come back undefined and the panel would
	// stay stuck in the empty state even after a successful generation.
	// `useEntityProp`'s upstream signature is loosely typed as
	// `[ any, Function, any ]`, so cast the destructured tuple shape we use
	// rather than reaching through `unknown` and indexing.
	const [ meta ] = useEntityProp( 'postType', postType, 'meta', postId ?? undefined ) as [
		Record< string, unknown > | undefined,
		( value: Record< string, unknown > ) => void,
		unknown,
	];

	const featureClipId = ( () => {
		const raw = meta?.[ FEATURE_CLIP_META_KEY ];
		const n = typeof raw === 'number' ? raw : Number( raw ?? 0 );
		return Number.isFinite( n ) && n > 0 ? n : null;
	} )();

	const { attachment, hasResolvedAttachment } = useSelect(
		( select ) => {
			if ( ! featureClipId ) {
				return { attachment: null, hasResolvedAttachment: true };
			}
			const core = select( 'core' ) as
				| {
						getMedia: ( id: number ) => MediaRecord | undefined;
						hasFinishedResolution: ( name: string, args: unknown[] ) => boolean;
				  }
				| undefined;
			return {
				attachment: core?.getMedia?.( featureClipId ) ?? null,
				// `getMedia` resolves async on first read. Until resolution
				// finishes the result is `undefined`, which would otherwise
				// flicker the panel into the empty CTA on reload before the
				// preview appears. Defer the empty-state fallback until we
				// know the lookup is genuinely done.
				hasResolvedAttachment:
					core?.hasFinishedResolution?.( 'getMedia', [ featureClipId ] ) ?? false,
			};
		},
		[ featureClipId ]
	);

	// Fire one impression per panel mount — the denominator for sidebar
	// engagement rates. Empty deps: the panel mounts once per editor load.
	useEffect( () => {
		trackImageStudioFeatureClipPanelViewed();
	}, [] );

	const titleNode = (
		<span className="image-studio-feature-clip-panel__title">
			<span className="image-studio-feature-clip-panel__title-line">
				{ __( 'Feature Clip', __i18n_text_domain__ ) }
				<ExperimentalBadge variant="light" />
			</span>
		</span>
	);

	const videoUrl = attachment?.source_url ?? null;
	const durationSeconds =
		typeof attachment?.media_details?.length === 'number' ? attachment.media_details.length : null;
	const hasUsableClip = !! featureClipId && !! videoUrl;
	// Hold the panel body blank while the clip's attachment is resolving, so
	// reload doesn't briefly flash the empty CTA before the preview appears.
	const isResolvingAttachment = !! featureClipId && ! hasResolvedAttachment;

	// Body is described once and rendered into both sidebars. Each SlotFill
	// portal instantiates its own subtree, so FeatureClipPreview's share
	// hooks get one instance per sidebar — safe: the hooks have no
	// mount-time side effects and only the visible sidebar is interacted
	// with (same dual-instance shape as Jetpack SEO's shared panels).
	const body = ( () => {
		if ( hasUsableClip ) {
			return (
				<FeatureClipPreview
					videoUrl={ videoUrl }
					attachmentId={ featureClipId }
					durationSeconds={ durationSeconds }
				/>
			);
		}
		if ( isResolvingAttachment ) {
			return null;
		}
		return <FeatureClipEmptyState />;
	} )();

	return (
		<>
			<PluginDocumentSettingPanel
				name={ PANEL_NAME }
				// PluginDocumentSettingPanel.title is typed as string but renders any ReactNode at runtime;
				// the badge must live in the title row so it stays visible when the panel is collapsed.
				title={ titleNode as unknown as string }
				className="image-studio-feature-clip-panel"
			>
				{ body }
			</PluginDocumentSettingPanel>
			<Fill name="JetpackPluginSidebar">
				<PanelBody
					// PanelBody.title is typed as string but renders any ReactNode
					// at runtime — same cast rationale as the document panel above.
					title={ titleNode as unknown as string }
					className="image-studio-feature-clip-panel"
				>
					{ body }
				</PanelBody>
			</Fill>
		</>
	);
}

let pluginRegistered = false;

/**
 * Register the "Generate Feature Clip" sidebar plugin.
 *
 * Idempotent — safe to call multiple times. Skips registration when the
 * editor package isn't loaded on the page (e.g. wp-admin Media Library).
 */
export function registerFeatureClipSidebar(): void {
	if ( window.imageStudioData?.canGenerateVideoClips !== true ) {
		return;
	}

	if ( pluginRegistered ) {
		return;
	}

	if ( typeof PluginDocumentSettingPanel !== 'function' ) {
		return;
	}

	registerPlugin( PLUGIN_NAME, {
		render: FeatureClipPanel,
	} );
	pluginRegistered = true;
}

export { FeatureClipPanel, FeatureClipPreview, FeatureClipEmptyState, PLUGIN_NAME, PANEL_NAME };
