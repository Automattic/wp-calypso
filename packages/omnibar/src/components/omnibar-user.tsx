import { useViewportMatch } from '@wordpress/compose';
import { Stack } from '@wordpress/ui';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

import './omnibar-user.scss';

export function OmnibarUserNode( { node }: { node: OmnibarNode } ) {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<OmnibarMenu
			className="omnibar__user-menu"
			node={ {
				...node,
				render: ( { title, icon } ) => {
					const userAvatar = <span className="omnibar__user-avatar">{ icon }</span>;
					if ( ! isDesktop || ! title ) {
						return userAvatar;
					}
					return (
						<Stack direction="row" align="center" className="omnibar__user-label">
							<span>{ title }</span>
							{ userAvatar }
						</Stack>
					);
				},
				children: node.children?.map( ( child ) => ( {
					...child,
					children: child.children?.map( ( grandChild ) => {
						if ( grandChild.id === 'user-info' ) {
							return {
								...grandChild,
								render: ( { title, icon, meta } ) => (
									<Stack direction="row" gap="sm" align="center" className="omnibar__user">
										{ icon && <span className="omnibar__user-avatar">{ icon }</span> }
										<Stack direction="column" className="omnibar__user-details">
											<span>{ meta?.displayName }</span>
											<span className="omnibar__user-username">{ meta?.username }</span>
											<span>{ title }</span>
										</Stack>
									</Stack>
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
