import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { AdminBarNode, Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import type { User } from '@automattic/api-core';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

const UNSUPPORTED_DOTCOM_NODE_IDS = new Set( [
	'site-plan',
	'site-plan-badge',
	'site-status-badge',
	'my-wpcom-account',
] );

function removeUnsupportedDotcomNodes( nodes: AdminBarNode[] ) {
	return nodes.filter( ( node ) => ! UNSUPPORTED_DOTCOM_NODE_IDS.has( node.id ) );
}

export default function OmnibarContainer( { user }: { user?: User } ) {
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	const { data: { nodes: dashboardNodes } = {} } = useQuery( dashboardAdminBarQuery() );
	const { data: { nodes: siteNodes } = {} } = useQuery( {
		...siteAdminBarQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	const omnibarNodes = useMemo( () => {
		const nodes = siteNodes ?? dashboardNodes ?? [];
		const result = buildOmnibarNodesFromAdminBarNodes( removeUnsupportedDotcomNodes( nodes ) );

		if ( result.home ) {
			result.home.icon = <OmnibarHomeIcon />;
		}

		if ( site ) {
			if ( ! result.site ) {
				result.site = {
					id: 'site-name',
					title: '',
					children: [],
				};
			}

			result.site.icon = <SiteIcon site={ site } size={ 20 } />;
			result.site.title = getSiteDisplayName( site );
		}

		return result;
	}, [ dashboardNodes, siteNodes, site ] );

	if ( ! hydrated ) {
		return <InitialOmnibar user={ user } />;
	}
	return <Omnibar nodes={ omnibarNodes } onClickResponsiveMenu={ onClickResponsiveMenu } />;
}

export function InitialOmnibar( { user }: { user?: User } ) {
	return (
		<Omnibar
			nodes={ {
				home: {
					id: '',
					title: '',
					icon: <OmnibarHomeIcon />,
				},
				user: {
					id: '',
					title: '',
					icon: user ? <img src={ user.avatar_URL } alt="" /> : undefined,
				},
			} }
			onClickResponsiveMenu={ onClickResponsiveMenu }
		/>
	);
}
