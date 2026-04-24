import { OmnibarItem } from './omnibar-item';
import type { OmnibarNode } from '../types';

export function OmnibarHomeNode( { node }: { node: OmnibarNode } ) {
	return <OmnibarItem node={ node } content={ node.icon } />;
}
