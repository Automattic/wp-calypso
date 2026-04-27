import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
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
				children: node.children?.map( ( child ) => ( {
					...child,
					children: child.children?.map( ( grandChild ) => {
						if ( grandChild.id === 'user-info' ) {
							return {
								...grandChild,
								render: ( { title, icon, meta } ) => (
									<HStack spacing={ 3 } expanded={ false }>
										{ icon && <span className="omnibar__user-avatar">{ icon }</span> }
										<VStack>
											<span>{ meta?.displayName }</span>
											<span>@{ meta?.username }</span>
											<span>{ title }</span>
										</VStack>
									</HStack>
								),
							};
						}
						return grandChild;
					} ),
				} ) ),
			} }
		/>
	);
}
