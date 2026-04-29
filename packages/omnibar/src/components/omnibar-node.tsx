import { __experimentalHStack as HStack } from '@wordpress/components';
import type { OmnibarNode } from '../types';

export function OmnibarNodeContent( { node }: { node: OmnibarNode } ) {
	if ( node.render ) {
		return node.render( node );
	}
	if ( node.icon && node.title ) {
		return (
			<HStack>
				{ node.icon }
				<span>{ node.title }</span>
			</HStack>
		);
	}
	return node.icon ?? node.title;
}
