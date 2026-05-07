/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel (from `@wordpress/editor`) in the
 * Gutenberg post editor with a short description + Generate clip button. The
 * panel header carries an "Experimental" badge. Visual rhythm matches the
 * surrounding sidebar panels (Excerpt, Categories, Featured Image) rather
 * than introducing a saturated hero card.
 */
import { Button } from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ExperimentalBadge } from '../components/experimental-badge';
import { FeatureClipRenderHost } from '../compositor/feature-clip-render-host';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import { FeatureClipProgress } from './feature-clip-progress';
import { FeatureClipResult } from './feature-clip-result';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';

function FeatureClipPanelIdle(): JSX.Element {
	const handleClick = async () => {
		const { openImageStudio } = dispatch( imageStudioStore );
		const { setCurrentVideoUrl, setCurrentAttachmentId, setCurrentDurationSeconds } = dispatch(
			videoStudioStore
		) as VideoStudioActions;
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
	};

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
				onClick={ handleClick }
			>
				{ __( 'Generate clip', __i18n_text_domain__ ) }
			</Button>
		</>
	);
}

interface AttachmentRecord {
	id: number;
	source_url?: string;
	media_details?: { length?: number };
}

/**
 * Hydrates videoStudioStore from `meta.image_studio_feature_clip_id` so the
 * result panel survives a page reload (mirrors how featured images persist).
 * Renders nothing — it's a side-effect-only component mounted alongside the
 * panel. Won't fight an in-flight render or a freshly completed one: only
 * runs when there's no pending render and the store doesn't already match
 * the meta.
 */
function FeatureClipMetaHydrator(): null {
	const attachmentIdFromMeta = useSelect( ( select ) => {
		const meta = (
			select( 'core/editor' ) as {
				getEditedPostAttribute?: ( attr: string ) => Record< string, unknown > | undefined;
			}
		 )?.getEditedPostAttribute?.( 'meta' );
		const raw = meta?.image_studio_feature_clip_id;
		const id = typeof raw === 'number' ? raw : Number( raw );
		return Number.isFinite( id ) && id > 0 ? id : null;
	}, [] );

	const attachment = useSelect(
		( select ) => {
			if ( ! attachmentIdFromMeta ) {
				return null;
			}
			const coreSelect = select( 'core' ) as {
				getEntityRecord?: (
					kind: string,
					name: string,
					key: number
				) => AttachmentRecord | undefined;
			};
			return (
				coreSelect?.getEntityRecord?.( 'postType', 'attachment', attachmentIdFromMeta ) ?? null
			);
		},
		[ attachmentIdFromMeta ]
	);

	const pending = useSelect(
		( select ) => select( videoStudioStore ).getPendingFeatureClipRender(),
		[]
	);
	const currentAttachmentId = useSelect(
		( select ) => select( videoStudioStore ).getCurrentAttachmentId(),
		[]
	);

	useEffect( () => {
		if ( pending ) {
			return;
		}
		// One-way hydrate: only WRITE to the store when meta has a valid
		// attachment. NEVER clear the store from this effect. Saving the post
		// causes core/editor to refetch, and during that window
		// getEditedPostAttribute('meta') can transiently return undefined for
		// our key, which used to trigger an aggressive wipe of currentVideoUrl
		// — making the result panel disappear after every save.
		if ( ! attachmentIdFromMeta || ! attachment?.source_url ) {
			return;
		}
		if ( currentAttachmentId === attachmentIdFromMeta ) {
			return;
		}
		const actions = dispatch( videoStudioStore ) as unknown as VideoStudioActions;
		actions.setCurrentVideoUrl( attachment.source_url );
		actions.setCurrentAttachmentId( attachmentIdFromMeta );
		const length = attachment.media_details?.length;
		actions.setCurrentDurationSeconds(
			typeof length === 'number' && Number.isFinite( length ) && length > 0 ? length : null
		);
	}, [ pending, attachmentIdFromMeta, attachment, currentAttachmentId ] );

	return null;
}

function FeatureClipPanel(): JSX.Element {
	const pendingRender = useSelect(
		( select ) => select( videoStudioStore ).getPendingFeatureClipRender(),
		[]
	);
	const currentVideoUrl = useSelect(
		( select ) => select( videoStudioStore ).getCurrentVideoUrl(),
		[]
	);

	const titleNode = (
		<span className="image-studio-feature-clip-panel__title">
			<span className="image-studio-feature-clip-panel__title-line">
				{ __( 'Generate', __i18n_text_domain__ ) }
			</span>
			<span className="image-studio-feature-clip-panel__title-line">
				{ __( 'Feature Clip', __i18n_text_domain__ ) }
				<ExperimentalBadge variant="light" />
			</span>
		</span>
	);

	let body: JSX.Element;
	if ( pendingRender ) {
		body = <FeatureClipProgress />;
	} else if ( currentVideoUrl ) {
		body = <FeatureClipResult />;
	} else {
		body = <FeatureClipPanelIdle />;
	}

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
			{ /* Always-mounted render host: lives outside the Image Studio modal so
			     a render survives a modal close. The host is a no-op until a
			     pendingRender appears in the store. */ }
			<FeatureClipRenderHost />
			<FeatureClipMetaHydrator />
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

export { FeatureClipPanel, PLUGIN_NAME, PANEL_NAME };
