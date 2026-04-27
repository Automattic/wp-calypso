import { __experimentalHStack as HStack } from '@wordpress/components';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarSiteNode( { node }: { node: OmnibarNode } ) {
	return (
		<OmnibarMenu
			node={ {
				...node,
				render: ( { icon, title } ) => (
					<HStack>
						{ icon }
						<span>{ title }</span>
					</HStack>
				),
			} }
		/>
	);
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
						{ meta?.subtitle && <span>{ meta.subtitle }</span> }
					</HStack>
				),
			} }
		/>
	) );
}
