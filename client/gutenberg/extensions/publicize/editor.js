/** @format */

/**
 * Top-level Publicize plugin for Gutenberg editor.
 *
 * Hooks into Gutenberg's PluginPrePublishPanel
 * to display Jetpack's Publicize UI in the pre-publish flow.
 */

/**
 * Internal dependencies
 */
import './editor.scss';
import PublicizePanel from './panel';
import registerJetpackPlugin from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-plugin';

registerJetpackPlugin( 'publicize', {
	render: () => <PublicizePanel />,
} );
