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
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ExperimentalBadge } from '../components/experimental-badge';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';

function FeatureClipPanel(): JSX.Element {
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

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			// PluginDocumentSettingPanel.title is typed as string but renders any ReactNode at runtime;
			// the badge must live in the title row so it stays visible when the panel is collapsed.
			title={ titleNode as unknown as string }
			className="image-studio-feature-clip-panel"
		>
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

export { FeatureClipPanel, PLUGIN_NAME, PANEL_NAME };
