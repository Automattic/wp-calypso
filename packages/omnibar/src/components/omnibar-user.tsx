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
				render: ( { title, icon } ) => {
					const userAvatar = <span className="omnibar__user-avatar">{ icon }</span>;
					if ( ! title ) {
						return userAvatar;
					}
					return (
						<HStack spacing={ 1 }>
							<span>{ title }</span>
							{ userAvatar }
						</HStack>
					);
				},
				children: node.children?.map( ( child ) => ( {
					...child,
					children: child.children?.map( ( grandChild ) => {
						if ( grandChild.id === 'user-info' ) {
							return {
								...grandChild,
								render: ( { title, icon, meta } ) => (
									<HStack spacing={ 3 } expanded={ false } className="omnibar__user">
										{ icon && <span className="omnibar__user-avatar">{ icon }</span> }
										<VStack>
											<VStack spacing={ 1 }>
												<span>{ meta?.displayName }</span>
												<span className="omnibar__user-info">@{ meta?.username }</span>
											</VStack>
											<span className="omnibar__user-info">{ title }</span>
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
