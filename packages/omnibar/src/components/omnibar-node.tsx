import { Stack } from '@wordpress/ui';
import type { OmnibarNode } from '../types';

export function OmnibarNodeContent( { node }: { node: OmnibarNode } ) {
	if ( node.render ) {
		return node.render( node );
	}
	if ( node.icon && node.title ) {
		return (
			<Stack direction="row" gap="sm" align="center">
				{ node.icon }
				<span>{ node.title }</span>
			</Stack>
		);
	}
	return node.icon ?? node.title;
}
