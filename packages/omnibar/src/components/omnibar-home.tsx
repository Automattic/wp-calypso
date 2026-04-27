import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

export function OmnibarHomeNode( { node }: { node: OmnibarNode } ) {
	return <OmnibarMenu node={ { ...node, render: ( { icon } ) => icon } } />;
}
