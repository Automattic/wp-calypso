import { __experimentalHStack as HStack } from '@wordpress/components';
import { OmnibarItem } from './omnibar-item';
import type { OmnibarNode } from '../types';

export function OmnibarSiteNode( { node }: { node: OmnibarNode } ) {
	return (
		<OmnibarItem
			node={ node }
			content={
				<HStack>
					{ node.icon }
					<span>{ node.title }</span>
				</HStack>
			}
		/>
	);
}

export function OmnibarSiteActionsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => (
		<OmnibarItem
			key={ node.id }
			node={ node }
			content={
				<HStack spacing={ 1 }>
					<span>{ node.title }</span>
					{ node.subtitle && <span>{ node.subtitle }</span> }
				</HStack>
			}
		/>
	) );
}
