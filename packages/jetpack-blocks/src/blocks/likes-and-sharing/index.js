/** @format */

/**
 * A Gutenberg sidebar extension that allows enabling/disabling
 * likes and sharing buttons.
 *
 * Hooks into our dedicated Jetpack plugin sidebar to display the UI.
 */

/**
 * Internal dependencies
 */
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import LikesAndSharesPanel from './panel';

export const name = 'likes-and-sharing';

export const settings = {
	render: () => (
		<JetpackPluginSidebar>
			<LikesAndSharesPanel />
		</JetpackPluginSidebar>
	),
};
