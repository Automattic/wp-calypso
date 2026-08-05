import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { AdminBarNode, Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getSiteDisplayName } from '../../utils/site-name';
import { useAppContext } from '../context';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { useHelpCenterPlugin } from './plugin-help-center';
import { useNotificationsPlugin } from './plugin-notifications';
import { useStatsSparklinePlugin } from './plugin-stats-sparkline';
import type { AppConfig } from '../context';
import type { User } from '@automattic/api-core';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

const UNSUPPORTED_DOTCOM_NODE_IDS = new Set( [
	'site-plan',
	'site-plan-badge',
	'site-status-badge',
	'my-wpcom-account',
] );

function removeUnsupportedNodes( nodes: AdminBarNode[], supports: AppConfig[ 'supports' ] ) {
	return nodes.filter( ( node ) => {
		if ( UNSUPPORTED_DOTCOM_NODE_IDS.has( node.id ) ) {
			return false;
		}
		// The palette is only mounted where the app supports it, so elsewhere the
		// admin bar's button would open nothing.
		return node.id !== 'command-palette' || supports.commandPalette;
	} );
}

export default function OmnibarContainer( { user }: { user?: User } ) {
	const { supports } = useAppContext();
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

	const baseOmnibarNodes = useMemo( () => {
		const nodes = siteNodes ?? dashboardNodes ?? [];
		const result = buildOmnibarNodesFromAdminBarNodes( removeUnsupportedNodes( nodes, supports ) );

		if ( ! result.home ) {
			result.home = { id: '' };
		}

		result.home.icon = <OmnibarHomeIcon />;

		if ( site ) {
			if ( ! result.site ) {
				result.site = {
					id: 'site-name',
					icon: <span className="omnibar__site-icon" />,
					children: [],
				};
			}

			result.site.title = getSiteDisplayName( site );
		}

		return result;
	}, [ dashboardNodes, siteNodes, site, supports ] );

	const helpCenterPluginNode = useHelpCenterPlugin();
	const notificationsPluginNode = useNotificationsPlugin( { user } );
	const statsSparklineNode = useStatsSparklinePlugin( { siteId, site } );
	const siteActions = statsSparklineNode
		? [ ...( baseOmnibarNodes.siteActions ?? [] ), statsSparklineNode ]
		: baseOmnibarNodes.siteActions;

	const omnibarNodes = {
		...baseOmnibarNodes,
		siteActions,
		plugins: [ helpCenterPluginNode, notificationsPluginNode ],
	};

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
					icon: <OmnibarHomeIcon />,
				},
				user: {
					id: '',
					icon: user ? <img src={ user.avatar_URL } alt="" /> : undefined,
				},
			} }
			onClickResponsiveMenu={ onClickResponsiveMenu }
		/>
	);
}
