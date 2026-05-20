import { Stack } from '@wordpress/ui';
import type { OmnibarNode } from '../types';

export function OmnibarNodeContent( { node }: { node: OmnibarNode } ) {
	if ( node.render ) {
		return node.render( node );
	}
	if ( node.icon && node.title ) {
		return (
			<Stack direction="row" gap="sm" align="center" style={ { minWidth: 0 } }>
				<span style={ { flexShrink: 0 } }>{ node.icon }</span>
				<span
					style={ {
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						minWidth: 0,
					} }
				>
					{ node.title }
				</span>
			</Stack>
		);
	}
	return node.icon ?? node.title;
}
