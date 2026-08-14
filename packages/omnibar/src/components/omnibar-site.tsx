import { Stack } from '@wordpress/ui';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarSiteNode( {
	node,
	pluginNodes,
	actionNodes,
}: {
	node: OmnibarNode;
	pluginNodes?: OmnibarNode[];
	actionNodes?: OmnibarNode[];
} ) {
	return [
		<OmnibarMenu key={ node.id } node={ node } className="omnibar__site" />,
		pluginNodes && <OmnibarSitePluginsNode key="plugins" nodes={ pluginNodes } />,
		actionNodes && <OmnibarSiteActionsNode key="actions" nodes={ actionNodes } />,
	].filter( Boolean );
}

export function OmnibarSitePluginsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => <OmnibarMenu key={ node.id } node={ node } /> );
}

export function OmnibarSiteActionsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => (
		<OmnibarMenu
			key={ node.id }
			node={ {
				render: ( { icon, title, meta } ) => (
					<Stack direction="row" align="center" className="omnibar__site-action">
						{ icon }
						{ title && <span className="omnibar__label">{ title }</span> }
						{ meta?.subtitle && <span className="omnibar__label">{ meta.subtitle }</span> }
					</Stack>
				),
				...node,
			} }
		/>
	) );
}
