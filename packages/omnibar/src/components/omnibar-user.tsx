import { OmnibarItem } from './omnibar-item';
import type { OmnibarNode } from '../types';

export function OmnibarUserNode( { node }: { node: OmnibarNode } ) {
	return <OmnibarItem node={ node } content={ node.title } />;
}
