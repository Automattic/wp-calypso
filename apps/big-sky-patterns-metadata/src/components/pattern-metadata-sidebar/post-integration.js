/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
/**
 * Internal dependencies
 */
import { PatternMetadataIcon } from './icon';
import PatternMetadataSidebar from './index';

/**
 * Register the Pattern Metadata Sidebar plugin
 */
registerPlugin( 'a8c-big-sky-patterns-metadata-sidebar', {
	render: () => (
		<PluginSidebar
			name="a8c-big-sky-patterns-metadata-sidebar"
			title={ __( 'Pattern Metadata', 'pattern-metadata-sidebar' ) }
			icon={ PatternMetadataIcon }
		>
			<PatternMetadataSidebar />
		</PluginSidebar>
	),
	icon: PatternMetadataIcon,
} );
