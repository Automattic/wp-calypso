import { useViewportMatch } from '@wordpress/compose';
import { Stack } from '@wordpress/ui';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

import './omnibar-user.scss';

export function OmnibarUserNode( { node }: { node: OmnibarNode } ) {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<OmnibarMenu
			node={ {
				...node,
				render: ( { title, icon } ) => {
					const userAvatar = <span className="omnibar__user-avatar">{ icon }</span>;
					if ( ! isDesktop || ! title ) {
						return userAvatar;
					}
					return (
						<Stack direction="row" gap="xs" align="center">
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
									<Stack direction="row" gap="md" align="center" className="omnibar__user">
										{ icon && <span className="omnibar__user-avatar">{ icon }</span> }
										<Stack direction="column" gap="sm">
											<Stack direction="column" gap="xs">
												<span>{ meta?.displayName }</span>
												<span className="omnibar__user-info">@{ meta?.username }</span>
											</Stack>
											<span className="omnibar__user-info">{ title }</span>
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
