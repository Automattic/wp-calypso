import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';

registerPlugin( 'etk-help-center', {
	render: () => {
		debugger;
		return (
			<PluginSidebarMoreMenuItem
				icon={
					<svg width="20" viewBox="0 0 20 20">
						<circle r="10" x="10" y="10" />
					</svg>
				}
				target="global-styles"
			>
				sss
			</PluginSidebarMoreMenuItem>
		);
	},
} );

console.log( 'omar4' );
