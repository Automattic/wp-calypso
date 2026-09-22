import { isSupportSession } from '@automattic/calypso-support-session';
import { Omnibar } from '@automattic/omnibar';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../app/context';
import { omnibarEvents } from '../app/omnibar/events';
import { InitialOmnibar } from '../app/omnibar/omnibar';
import { useHelpCenterPlugin } from '../app/omnibar/plugin-help-center';
import { createLogoutNodeBuilder } from '../app/omnibar/plugin-logout';
import {
	RESPONSIVE_MENU_NODE_ID,
	trackOmnibarNodes,
	useRecordOmnibarNodeClick,
} from '../app/omnibar/tracking';
import { useOmnibarUser } from '../app/omnibar/user';
import { wpcomLink } from '../utils/link';
import { A4AOmnibarHomeIcon } from './omnibar-home-icon';
import type { User } from '@automattic/api-core';
import type { OmnibarNode, OmnibarNodes } from '@automattic/omnibar';

function buildUserNode( user: User ): OmnibarNode {
	const avatar = <img src={ user.avatar_URL } alt="" />;

	return {
		id: 'a4a-account',
		label: __( 'Account' ),
		icon: avatar,
		// One group: the popover indents every item in the group that holds the
		// user card, which is what lines the links up under the name.
		children: [
			{
				id: 'a4a-account-menu',
				group: true,
				children: [
					{
						id: 'user-info',
						disabled: true,
						icon: avatar,
						meta: { displayName: user.display_name, username: user.username },
					},
					{
						id: 'a4a-profile',
						title: __( 'Manage your profile' ),
						href: wpcomLink( '/me' ),
						target: '_blank',
						rel: 'noopener noreferrer',
					},
					{
						id: 'logout',
						title: __( 'Sign out' ),
						...createLogoutNodeBuilder( user )(),
					},
				],
			},
		],
	};
}

export default function A4AOmnibar( { user }: { user?: User } ) {
	const { supports, mainRoute } = useAppContext();
	const recordNodeClick = useRecordOmnibarNodeClick();
	// The server renders `InitialOmnibar`, so the first client render must match
	// it; the full bar only replaces it once mounted.
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const authUser = useOmnibarUser( { user, enabled: hydrated } );
	const helpCenterNode = useHelpCenterPlugin( { sectionName: 'dashboard', adminBarNodes: [] } );

	const nodes = useMemo< OmnibarNodes >(
		() => ( {
			home: {
				id: 'a4a-home',
				label: __( 'Overview' ),
				icon: <A4AOmnibarHomeIcon />,
				href: mainRoute,
				onClick: ( event ) =>
					omnibarEvents.linkClick.emit( { href: mainRoute, event: event.nativeEvent } ),
			},
			plugins: authUser && supports.help ? [ helpCenterNode ] : [],
			user: authUser ? buildUserNode( authUser ) : undefined,
		} ),
		[ authUser, helpCenterNode, mainRoute, supports.help ]
	);

	const handleClickResponsiveMenu = () => {
		recordNodeClick( RESPONSIVE_MENU_NODE_ID );
		omnibarEvents.mobileMenu.emit();
	};

	if ( ! hydrated ) {
		return <InitialOmnibar user={ user } homeIcon={ <A4AOmnibarHomeIcon /> } />;
	}

	return (
		<Omnibar
			nodes={ trackOmnibarNodes( nodes, recordNodeClick ) }
			onClickResponsiveMenu={ handleClickResponsiveMenu }
			className={ isSupportSession() ? 'is-support-session' : undefined }
		/>
	);
}
