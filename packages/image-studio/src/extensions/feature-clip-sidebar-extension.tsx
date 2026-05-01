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

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';

function FeatureClipPanel(): JSX.Element {
	const handleClick = async () => {
		const { openImageStudio } = dispatch( imageStudioStore );
		// Reset any previously generated clip so a fresh session starts with
		// an empty canvas instead of replaying the prior video. wp-data action
		// dispatches resolve asynchronously, so await them before opening the
		// modal to prevent a stale clip flashing on first render.
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
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
			title={ __( 'Generate Feature Clip', __i18n_text_domain__ ) }
			className="image-studio-feature-clip-panel"
		>
			<p className="image-studio-feature-clip-panel__description">
				{ __(
					'Generate a short video clip based on this post. We use the post content and your site guidelines as a starting point.',
					__i18n_text_domain__
				) }
			</p>
			<Button
				variant="secondary"
				className="image-studio-feature-clip-panel__button"
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
	// Server-side dev-mode flag — synchronous read, no network. The host
	// platform decides which environments expose this panel and injects the
	// flag inline before this script runs. Gate first so production sites
	// skip the rest of the checks entirely.
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
