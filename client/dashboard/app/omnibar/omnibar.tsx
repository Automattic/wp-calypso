import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { AdminBarNode, Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { dashboardLink, wpcomLink } from '../../utils/link';
import { getSiteDisplayName } from '../../utils/site-name';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import { useAppContext } from '../context';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { createAiChatNodeBuilder } from './plugin-ai-chat';
import { addDashboardNode, useDashboardPlugin } from './plugin-dashboard';
import { useHelpCenterPlugin } from './plugin-help-center';
import { useLanguageSwitcherPlugin } from './plugin-language-switcher';
import { useLaunchSitePlugin } from './plugin-launch-site';
import { createLogoutNodeBuilder } from './plugin-logout';
import { useNotificationsPlugin } from './plugin-notifications';
import { useReaderPlugin } from './plugin-reader';
import { useShoppingCartPlugin } from './plugin-shopping-cart';
import { buildSiteBadgeNode } from './plugin-site-badges';
import { useStatsSparklinePlugin } from './plugin-stats-sparkline';
import { buildWpcomAccountNode } from './plugin-wpcom-account';
import { RESPONSIVE_MENU_NODE_ID, trackOmnibarNodes, useRecordOmnibarNodeClick } from './tracking';
import type { AppConfig } from '../context';
import type { User } from '@automattic/api-core';
import type { OmnibarNodeBuilders } from '@automattic/omnibar';
import type { ShoppingCartManagerClient } from '@automattic/shopping-cart';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

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
			return dashboardLink( path );
		}
		if ( url.host === 'wordpress.com' ) {
			return wpcomLink( path );
		}
		return url.href;
	};
}

export default function OmnibarContainer( {
	user,
	cartManagerClient,
	sectionGroup,
	sectionName,
}: {
	user?: User;
	cartManagerClient: ShoppingCartManagerClient;
	sectionGroup?: string;
	sectionName?: string;
} ) {
	return (
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<ConnectedOmnibar user={ user } sectionGroup={ sectionGroup } sectionName={ sectionName } />
		</ShoppingCartProvider>
	);
}

function ConnectedOmnibar( {
	user,
	sectionGroup,
	sectionName,
}: {
	user?: User;
	sectionGroup?: string;
	sectionName?: string;
} ) {
	const { supports } = useAppContext();
	const recordNodeClick = useRecordOmnibarNodeClick();
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

	const { data: authUser } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		initialData: user,
		enabled: hydrated,
		staleTime: 30 * 60 * 1000,
		retry: false,
		meta: { persist: false },
	} );

	const nodeBuilders = useMemo< OmnibarNodeBuilders >(
		() => ( {
			'my-wpcom-account': buildWpcomAccountNode,
			'site-plan-badge': buildSiteBadgeNode,
			'site-status-badge': buildSiteBadgeNode,
			...( supports.help
				? { 'agents-manager-ai-chat': createAiChatNodeBuilder( sectionName ) }
				: {} ),
			...( authUser ? { logout: createLogoutNodeBuilder( authUser ) } : {} ),
		} ),
		[ authUser, sectionName, supports.help ]
	);

	const adminBarNodes = useMemo(
		() => siteNodes ?? dashboardNodes ?? [],
		[ siteNodes, dashboardNodes ]
	);

	const baseOmnibarNodes = useMemo( () => {
		const result = buildOmnibarNodesFromAdminBarNodes(
			removeUnsupportedNodes( adminBarNodes, supports ),
			nodeBuilders,
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
					icon: site.icon?.img ? (
						<img className="omnibar__site-icon" src={ site.icon.img } alt="" />
					) : (
						<span className="dashicons-before dashicons-admin-home" />
					),
					href: site.URL,
				};
			}

			result.site.title = getSiteDisplayName( site );
		}

		return result;
	}, [ adminBarNodes, siteNodes, site, supports, nodeBuilders ] );

	const readerPluginNode = useReaderPlugin( { sectionGroup } );
	const helpCenterPluginNode = useHelpCenterPlugin( { sectionName, adminBarNodes } );
	const notificationsPluginNode = useNotificationsPlugin( { user } );
	const { node: languageSwitcherNode, panel: languageSwitcherPanel } = useLanguageSwitcherPlugin( {
		user,
	} );
	const { node: shoppingCartNode, panel: shoppingCartPanel } = useShoppingCartPlugin( { site } );
	const statsSparklineNode = useStatsSparklinePlugin( { site } );
	const { node: launchSiteNode, panel: launchSitePanel } = useLaunchSitePlugin( { site } );
	const dashboardNode = useDashboardPlugin( { site, sectionGroup } );
	const siteNode = addDashboardNode( baseOmnibarNodes.site, dashboardNode );
	const siteActions = [
		...( baseOmnibarNodes.siteActions ?? [] ),
		statsSparklineNode,
		launchSiteNode,
	].filter( ( node ) => node !== undefined );

	const plugins = baseOmnibarNodes.user
		? [
				...( languageSwitcherNode ? [ languageSwitcherNode ] : [] ),
				...( shoppingCartNode ? [ shoppingCartNode ] : [] ),
				...( supports.reader ? [ readerPluginNode ] : [] ),
				...( supports.help ? [ helpCenterPluginNode ] : [] ),
				// Ask AI, plus any other node a builder claimed above.
				...( baseOmnibarNodes.plugins ?? [] ),
				...( supports.notifications ? [ notificationsPluginNode ] : [] ),
		  ]
		: [];

	const omnibarNodes = trackOmnibarNodes(
		{
			...baseOmnibarNodes,
			site: siteNode,
			siteActions,
			plugins,
		},
		recordNodeClick
	);

	const handleClickResponsiveMenu = () => {
		recordNodeClick( RESPONSIVE_MENU_NODE_ID );
		onClickResponsiveMenu();
	};

	if ( ! hydrated ) {
		return <InitialOmnibar user={ user } />;
	}
	return (
		<>
			<Omnibar
				nodes={ omnibarNodes }
				onClickResponsiveMenu={ handleClickResponsiveMenu }
				className={ isSupportSession() ? 'is-support-session' : undefined }
			/>
			{ shoppingCartPanel }
			{ languageSwitcherPanel }
			{ launchSitePanel }
		</>
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
