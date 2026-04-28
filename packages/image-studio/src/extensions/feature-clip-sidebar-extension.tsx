/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel (from `@wordpress/editor`) in the
 * Gutenberg post editor with a single button that opens the studio in
 * video-generation mode. Mirrors the shape of Jetpack's "Generate featured
 * image" sidebar panel.
 */
import { Button } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'big-sky-feature-clip';
const PANEL_NAME = 'big-sky-feature-clip-panel';

function FeatureClipPanel(): JSX.Element {
	const handleClick = () => {
		const { openImageStudio } = dispatch( imageStudioStore );
		// Reset any previously generated clip so a fresh session starts with
		// an empty canvas instead of replaying the prior video.
		const { setCurrentVideoUrl } = dispatch( videoStudioStore ) as VideoStudioActions;
		setCurrentVideoUrl( null );

		trackImageStudioOpened( {
			mode: ImageStudioMode.Generate,
			entryPoint: ImageStudioEntryPoint.PostEditorFeatureClip,
		} );

		openImageStudio( undefined, undefined, ImageStudioEntryPoint.PostEditorFeatureClip );
	};

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			title={ __( 'Generate Feature Clip', __i18n_text_domain__ ) }
			className="big-sky-feature-clip-panel"
		>
			<p className="big-sky-feature-clip-panel__description">
				{ __(
					'Generate a short video clip based on this post. We use the post content and your site guidelines as a starting point.',
					__i18n_text_domain__
				) }
			</p>
			<Button
				variant="secondary"
				className="big-sky-feature-clip-panel__button"
				__next40pxDefaultSize
				onClick={ handleClick }
			>
				{ __( 'Generate clip', __i18n_text_domain__ ) }
			</Button>
			<p className="big-sky-feature-clip-panel__media-library-disclaimer">
				<em>
					{ __(
						'All generated videos will be automatically saved to your media library.',
						__i18n_text_domain__
					) }
				</em>
			</p>
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
