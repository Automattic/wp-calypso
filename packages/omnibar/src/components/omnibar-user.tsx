import { __experimentalHStack as HStack } from '@wordpress/components';
import { OmnibarItem } from './omnibar-item';
import type { OmnibarNode } from '../types';

import './omnibar-user.scss';

export function OmnibarUserNode( { node }: { node: OmnibarNode } ) {
	return (
		<OmnibarItem
			node={ node }
			content={
				<HStack spacing={ 2 }>
					<span>{ node.title }</span>
					{ node.icon && <span className="omnibar__user-avatar">{ node.icon }</span> }
				</HStack>
			}
		/>
	);
}
