import { __experimentalHStack as HStack } from '@wordpress/components';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

import './omnibar-user.scss';

export function OmnibarUserNode( { node }: { node: OmnibarNode } ) {
	return (
		<OmnibarMenu
			node={ {
				...node,
				render: ( { title, icon } ) => (
					<HStack spacing={ 2 }>
						<span>{ title }</span>
						{ icon && <span className="omnibar__user-avatar">{ icon }</span> }
					</HStack>
				),
			} }
		/>
	);
}
