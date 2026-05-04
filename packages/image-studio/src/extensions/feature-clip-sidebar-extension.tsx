/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel (from `@wordpress/editor`) in the
 * Gutenberg post editor with a hero card that opens the studio in
 * video-generation mode. The panel header carries an "Experimental" pill
 * with a hover/focus tooltip explaining the feature's status.
 */
import { Tooltip } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';

function ExperimentalPill(): JSX.Element {
	return (
		<Tooltip
			text={ __(
				'This is an experimental AI feature. Outputs may need editing before publishing.',
				__i18n_text_domain__
			) }
		>
			<span
				className="image-studio-feature-clip-panel__experimental-pill"
				// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can surface the tooltip
				tabIndex={ 0 }
			>
				{ __( 'Experimental', __i18n_text_domain__ ) }
			</span>
		</Tooltip>
	);
}

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
				<ExperimentalPill />
			</span>
		</span>
	);

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			// PluginDocumentSettingPanel.title is typed as string but renders any ReactNode at runtime;
			// the pill must live in the title row so it stays visible when the panel is collapsed.
			title={ titleNode as unknown as string }
			className="image-studio-feature-clip-panel"
		>
			<div className="image-studio-feature-clip-panel__hero">
				<div className="image-studio-feature-clip-panel__hero-dots" aria-hidden="true" />
				<div className="image-studio-feature-clip-panel__hero-content">
					<div className="image-studio-feature-clip-panel__hero-title">
						{ __( 'Turn this post into a short clip', __i18n_text_domain__ ) }
					</div>
					<div className="image-studio-feature-clip-panel__hero-subtitle">
						{ __(
							"We'll use your post and site style as a starting point.",
							__i18n_text_domain__
						) }
					</div>
					<button
						type="button"
						className="image-studio-feature-clip-panel__hero-button"
						onClick={ handleClick }
					>
						<span aria-hidden="true" className="image-studio-feature-clip-panel__hero-button-icon">
							✦
						</span>
						{ __( 'Generate clip', __i18n_text_domain__ ) }
					</button>
				</div>
			</div>
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
