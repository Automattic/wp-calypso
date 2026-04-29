import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarPluginsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => (
		<OmnibarMenu key={ node.id } node={ { ...node, render: ( { icon } ) => icon } } />
	) );
}
