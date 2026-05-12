/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel (from `@wordpress/editor`) in the
 * Gutenberg post editor. When no clip is linked to the post, shows a short
 * description + Generate clip button. Once a clip exists (via the
 * `_jetpack_feature_clip_id` post meta registered by Jetpack's Image Studio
 * extension), shows a small video preview, a share row mirroring the modal,
 * and a Regenerate button.
 */
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { dispatch, useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { share } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import { SocialLogo } from 'social-logos';
import { ExperimentalBadge } from '../components/experimental-badge';
import { useGenericShare } from '../hooks/use-generic-share';
import { useReelShare } from '../hooks/use-reel-share';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
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
	const reel = useReelShare( { url: videoUrl, attachmentId, durationSeconds } );
	const generic = useGenericShare( { url: videoUrl, attachmentId } );

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
		insertBlocks?.( createBlock( 'core/video', { id: attachmentId, src: videoUrl } ) );
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
					onClick={ reel.handleShare }
				>
					{ reelLabel }
				</Button>
			) }
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

function FeatureClipPanel(): JSX.Element {
	const { postType, postId } = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as
			| {
					getCurrentPostType: () => string | null;
					getCurrentPostId: () => number | null;
			  }
			| undefined;
		return {
			postType: editor?.getCurrentPostType?.() ?? 'post',
			postId: editor?.getCurrentPostId?.() ?? null,
		};
	}, [] );

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

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			// PluginDocumentSettingPanel.title is typed as string but renders any ReactNode at runtime;
			// the badge must live in the title row so it stays visible when the panel is collapsed.
			title={ titleNode as unknown as string }
			className="image-studio-feature-clip-panel"
		>
			{ ( () => {
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
			} )() }
		</PluginDocumentSettingPanel>
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
	if ( window.imageStudioData?.canGenerateVideoClips === false ) {
		return;
	}

	if ( ! window.imageStudioData?.isDevMode ) {
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
