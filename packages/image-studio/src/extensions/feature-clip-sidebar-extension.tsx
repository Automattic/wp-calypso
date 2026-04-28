/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel in the Gutenberg post editor with a
 * single button that opens Image Studio in video-generation mode. Mirrors the
 * shape of Jetpack's "Generate featured image" sidebar panel.
 *
 * The wpcom-editor package provides PluginDocumentSettingPanel.
 */
import { Button } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import { useIsAutomattician } from '../utils/use-is-automattician';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'big-sky-feature-clip';
const PANEL_NAME = 'big-sky-feature-clip-panel';

function FeatureClipPanel(): JSX.Element | null {
	// Internal-release stop-gap: hide the entry point from non-Automatticians.
	// Long-term this surface should ship via Jetpack the same way Image Studio
	// does, with the gate handled there.
	const isAutomattician = useIsAutomattician();
	if ( ! isAutomattician ) {
		return null;
	}

	const handleClick = () => {
		const { openImageStudio } = dispatch( imageStudioStore );

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

	pluginRegistered = true;
	registerPlugin( PLUGIN_NAME, {
		render: FeatureClipPanel,
	} );
}

export { FeatureClipPanel, PLUGIN_NAME, PANEL_NAME };
