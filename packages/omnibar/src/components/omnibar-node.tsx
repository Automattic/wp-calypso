import { Stack } from '@wordpress/ui';
import type { OmnibarNode } from '../types';

export function OmnibarNodeContent( { node }: { node: OmnibarNode } ) {
	if ( node.render ) {
		return node.render( node );
	}
	if ( node.icon && node.title ) {
		return (
			<Stack direction="row" align="center" className="omnibar__node-content">
				<span style={ { display: 'flex', flexShrink: 0 } }>{ node.icon }</span>
				<span className="omnibar__label" style={ { whiteSpace: 'nowrap' } }>
					{ node.title }
				</span>
			</Stack>
		);
	}
	return node.icon ?? node.title;
}
