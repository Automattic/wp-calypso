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
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';
const FEATURE_CLIP_META_KEY = '_jetpack_feature_clip_id';

interface MediaRecord {
	id: number;
	source_url?: string;
	mime_type?: string;
	media_details?: { length?: number };
}

function openImageStudioForFeatureClip(): void {
	const { openImageStudio } = dispatch( imageStudioStore );
	const { setCurrentVideoUrl, setCurrentAttachmentId, setCurrentDurationSeconds } = dispatch(
		videoStudioStore
	) as VideoStudioActions;
	// Reset the modal-session store synchronously; the modal will repopulate it
	// on a successful regeneration.
	void Promise.all( [
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
		? __( 'Sharing to other apps…', __i18n_text_domain__ )
		: __( 'Share to other apps', __i18n_text_domain__ );

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
			{ ( reel.isVisible || generic.isVisible ) && (
				<div
					className="image-studio-feature-clip-panel__share-row"
					role="group"
					aria-label={ __( 'Share feature clip', __i18n_text_domain__ ) }
				>
					{ generic.isVisible && (
						<Button
							variant="secondary"
							icon={ share }
							className="image-studio-feature-clip-panel__share-button"
							label={ genericLabel }
							showTooltip
							disabled={ generic.isSharing }
							isBusy={ generic.isSharing }
							onClick={ generic.handleShare }
						/>
					) }
					{ reel.isVisible && (
						<Button
							variant="secondary"
							icon={ <SocialLogo icon="instagram" size={ 18 } /> }
							className="image-studio-feature-clip-panel__share-button"
							label={ reelLabel }
							showTooltip
							disabled={ reel.isSharing }
							isBusy={ reel.isSharing }
							onClick={ reel.handleShare }
						/>
					) }
				</div>
			) }
			<Button
				variant="secondary"
				className="image-studio-feature-clip-panel__cta"
				__next40pxDefaultSize
				onClick={ openImageStudioForFeatureClip }
			>
				{ __( 'Regenerate clip', __i18n_text_domain__ ) }
			</Button>
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
	const postType = useSelect(
		( select ) =>
			(
				select( 'core/editor' ) as { getCurrentPostType: () => string | null } | undefined
			 )?.getCurrentPostType?.() ?? 'post',
		[]
	);

	const entityPropResult = useEntityProp( 'postType', postType, 'meta' );
	const meta = ( entityPropResult as unknown as [ Record< string, unknown > | undefined ] )[ 0 ];

	const featureClipId = ( () => {
		const raw = meta?.[ FEATURE_CLIP_META_KEY ];
		const n = typeof raw === 'number' ? raw : Number( raw ?? 0 );
		return Number.isFinite( n ) && n > 0 ? n : null;
	} )();

	const attachment = useSelect(
		( select ) => {
			if ( ! featureClipId ) {
				return null;
			}
			const core = select( 'core' ) as
				| { getMedia: ( id: number ) => MediaRecord | undefined }
				| undefined;
			return core?.getMedia?.( featureClipId ) ?? null;
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

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			// PluginDocumentSettingPanel.title is typed as string but renders any ReactNode at runtime;
			// the badge must live in the title row so it stays visible when the panel is collapsed.
			title={ titleNode as unknown as string }
			className="image-studio-feature-clip-panel"
		>
			{ hasUsableClip ? (
				<FeatureClipPreview
					videoUrl={ videoUrl }
					attachmentId={ featureClipId }
					durationSeconds={ durationSeconds }
				/>
			) : (
				<FeatureClipEmptyState />
			) }
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

export {
	FeatureClipPanel,
	FeatureClipPreview,
	FeatureClipEmptyState,
	PLUGIN_NAME,
	PANEL_NAME,
	FEATURE_CLIP_META_KEY,
};
