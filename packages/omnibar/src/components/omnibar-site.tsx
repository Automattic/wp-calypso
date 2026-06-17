import { useViewportMatch } from '@wordpress/compose';
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
	const isDesktop = useViewportMatch( 'medium' );

	const siteNode = isDesktop
		? node
		: {
				...node,
				children: [ ...( node.children || [] ), ...( actionNodes || [] ) ],
		  };

	const siteActionNodes = isDesktop ? actionNodes : undefined;

	return [
		<OmnibarMenu key={ siteNode.id } node={ siteNode } style={ { minWidth: 0 } } />,
		pluginNodes && <OmnibarSitePluginsNode key="plugins" nodes={ pluginNodes } />,
		siteActionNodes && <OmnibarSiteActionsNode key="actions" nodes={ siteActionNodes } />,
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
				...node,
				render: ( { title, meta } ) => (
					<Stack direction="row" gap="xs" align="center">
						<span>{ title }</span>
						{ meta?.subtitle && (
							<span style={ { opacity: meta.subtitle !== '0' ? undefined : '0.5' } }>
								{ meta.subtitle }
							</span>
						) }
					</Stack>
				),
			} }
		/>
	) );
}
