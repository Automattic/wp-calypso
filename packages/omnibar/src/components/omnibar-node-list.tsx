import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarNodeList( {
	nodes,
	className,
}: {
	nodes: OmnibarNode[];
	className?: string;
} ) {
	return nodes.map( ( node ) => (
		<OmnibarMenu key={ node.id } node={ node } className={ className } />
	) );
}
