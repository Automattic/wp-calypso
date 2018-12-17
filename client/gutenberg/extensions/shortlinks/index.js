/**
 * Internal dependencies
 */
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import ShortlinksPanel from './panel';

export const name = 'shortlinks';

export const settings = {
	render: () => (
		<JetpackPluginSidebar>
			<ShortlinksPanel />
		</JetpackPluginSidebar>
	),
};
