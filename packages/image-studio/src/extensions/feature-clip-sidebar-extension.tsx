/**
 * "Generate Feature Clip" post-editor sidebar panel.
 *
 * Registers a PluginDocumentSettingPanel (from `@wordpress/editor`) in the
 * Gutenberg post editor with a hero card that opens the studio in
 * video-generation mode. Surfaces an "Experimental" pill in the panel header
 * and a dismissible callout explaining the experimental nature of the
 * feature. Mirrors the framing of Jetpack's "Generate featured image"
 * sidebar panel.
 */
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from 'react';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';
import './feature-clip-sidebar.scss';

const PLUGIN_NAME = 'image-studio-feature-clip';
const PANEL_NAME = 'image-studio-feature-clip-panel';
const EXPERIMENTAL_DISMISS_KEY = 'image-studio-feature-clip-experimental-dismissed';

function readDismissed(): boolean {
	try {
		return window.localStorage?.getItem( EXPERIMENTAL_DISMISS_KEY ) === '1';
	} catch {
		return false;
	}
}

function persistDismissed(): void {
	try {
		window.localStorage?.setItem( EXPERIMENTAL_DISMISS_KEY, '1' );
	} catch {}
}

function ExperimentalPill(): JSX.Element {
	return (
		<span className="image-studio-feature-clip-panel__experimental-pill">
			{ __( 'Experimental', __i18n_text_domain__ ) }
		</span>
	);
}

function FeatureClipPanel(): JSX.Element {
	const [ calloutOpen, setCalloutOpen ] = useState< boolean >( () => ! readDismissed() );

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

	const dismissCallout = () => {
		setCalloutOpen( false );
		persistDismissed();
	};

	const titleNode = (
		<span className="image-studio-feature-clip-panel__title">
			{ __( 'Generate Feature Clip', __i18n_text_domain__ ) }
			<ExperimentalPill />
		</span>
	);

	return (
		<PluginDocumentSettingPanel
			name={ PANEL_NAME }
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
			{ calloutOpen && (
				<div className="image-studio-feature-clip-panel__callout" role="note">
					<span aria-hidden="true" className="image-studio-feature-clip-panel__callout-icon">
						ⓘ
					</span>
					<span className="image-studio-feature-clip-panel__callout-text">
						{ __(
							'This is an experimental AI feature. Outputs may need editing before publishing.',
							__i18n_text_domain__
						) }
					</span>
					<button
						type="button"
						className="image-studio-feature-clip-panel__callout-dismiss"
						aria-label={ __( 'Dismiss', __i18n_text_domain__ ) }
						onClick={ dismissCallout }
					>
						×
					</button>
				</div>
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
