import { OmnibarMenu } from './omnibar-menu';
import { OmnibarNodeBoundary } from './omnibar-node-boundary';
import type { OmnibarNode } from '../types';

export function OmnibarNodeList( {
	nodes,
	className,
}: {
	nodes: OmnibarNode[];
	className?: string;
} ) {
	return nodes.map( ( node ) => (
		<OmnibarNodeBoundary key={ node.id }>
			<OmnibarMenu node={ node } className={ className } />
		</OmnibarNodeBoundary>
	) );
}
