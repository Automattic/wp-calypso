import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { AdminBarNode, Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { wpcomLink } from '../../utils/link';
import { getSiteDisplayName } from '../../utils/site-name';
import { useAppContext } from '../context';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { useAiChatPlugin } from './plugin-ai-chat';
import { useHelpCenterPlugin } from './plugin-help-center';
import { useNotificationsPlugin } from './plugin-notifications';
import { useReaderPlugin } from './plugin-reader';
import { buildSiteBadgeNode } from './plugin-site-badges';
import { useStatsSparklinePlugin } from './plugin-stats-sparkline';
import { buildWpcomAccountNode } from './plugin-wpcom-account';
import type { AppConfig } from '../context';
import type { User } from '@automattic/api-core';
import type { OmnibarNodeBuilders } from '@automattic/omnibar';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

const DOTCOM_NODE_BUILDERS: OmnibarNodeBuilders = {
	'my-wpcom-account': buildWpcomAccountNode,
	'site-plan-badge': buildSiteBadgeNode,
	'site-status-badge': buildSiteBadgeNode,
};

function removeUnsupportedNodes( nodes: AdminBarNode[], supports: AppConfig[ 'supports' ] ) {
	// The palette is only mounted where the app supports it, so elsewhere the
	// admin bar's button would open nothing.
	return nodes.filter( ( node ) => node.id !== 'command-palette' || supports.commandPalette );
}

function createHrefResolver( adminUrl?: string ) {
	return ( href: string ) => {
		let url;
		try {
			url = new URL( href, adminUrl );
		} catch {
			return href;
		}

		const path = url.pathname + url.search + url.hash;

		if ( url.host === 'my.wordpress.com' ) {
			return path;
		}
		if ( url.host === 'wordpress.com' ) {
			return wpcomLink( path );
		}
		return url.href;
	};
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
		const result = buildOmnibarNodesFromAdminBarNodes(
			removeUnsupportedNodes( nodes, supports ),
			DOTCOM_NODE_BUILDERS,
			createHrefResolver( siteNodes ? site?.options?.admin_url : undefined )
		);

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

	const readerPluginNode = useReaderPlugin();
	const helpCenterPluginNode = useHelpCenterPlugin();
	const aiChatPluginNode = useAiChatPlugin();
	const notificationsPluginNode = useNotificationsPlugin( { user } );
	const statsSparklineNode = useStatsSparklinePlugin( { siteId, site } );
	const siteActions = statsSparklineNode
		? [ ...( baseOmnibarNodes.siteActions ?? [] ), statsSparklineNode ]
		: baseOmnibarNodes.siteActions;

	const omnibarNodes = {
		...baseOmnibarNodes,
		siteActions,
		plugins: [
			...( supports.reader ? [ readerPluginNode ] : [] ),
			...( supports.help ? [ helpCenterPluginNode ] : [] ),
			...( supports.help && aiChatPluginNode ? [ aiChatPluginNode ] : [] ),
			...( supports.notifications ? [ notificationsPluginNode ] : [] ),
		],
	};

	if ( ! hydrated ) {
		return <InitialOmnibar user={ user } />;
	}
	return (
		<Omnibar
			nodes={ omnibarNodes }
			onClickResponsiveMenu={ onClickResponsiveMenu }
			className={ isSupportSession() ? 'is-support-session' : undefined }
		/>
	);
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
