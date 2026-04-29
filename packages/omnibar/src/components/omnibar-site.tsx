import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarSiteNode( {
	node,
	actionNodes,
}: {
	node: OmnibarNode;
	actionNodes?: OmnibarNode[];
} ) {
	const isDesktop = useViewportMatch( 'medium' );

	const siteNode = isDesktop
		? node
		: {
				...node,
				children: [
					...( node.children || [] ),
					...( actionNodes || [] ).filter( ( { id } ) => id !== 'new-content' ),
				],
		  };

	const siteActionNodes = isDesktop
		? actionNodes
		: actionNodes?.filter( ( { id } ) => id === 'new-content' );

	return [
		<OmnibarMenu key={ siteNode.id } node={ siteNode } />,
		siteActionNodes && <OmnibarSiteActionsNode nodes={ siteActionNodes } />,
	].filter( Boolean );
}

export function OmnibarSiteActionsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => (
		<OmnibarMenu
			key={ node.id }
			node={ {
				...node,
				render: ( { title, meta } ) => (
					<HStack spacing={ 1 }>
						<span>{ title }</span>
						{ meta?.subtitle && (
							<span style={ { opacity: meta.subtitle !== '0' ? undefined : '0.5' } }>
								{ meta.subtitle }
							</span>
						) }
					</HStack>
				),
			} }
		/>
	) );
}
