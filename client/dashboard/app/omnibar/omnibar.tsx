import {
	dashboardAdminBarQuery,
	omnibarAgentsManagerEnabledQuery,
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
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import { addMissingDefaultNodes } from './default-nodes';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { buildAiChatPluginNode } from './plugin-ai-chat';
import { addDashboardNode, useDashboardPlugin } from './plugin-dashboard';
import { createFreeDomainUpsellNodeBuilder } from './plugin-free-domain-upsell-experiment';
import { useHelpCenterNodeBuilder } from './plugin-help-center';
import { useLanguageSwitcherPlugin } from './plugin-language-switcher';
import { useLaunchSitePlugin } from './plugin-launch-site';
import { createLogoutNodeBuilder } from './plugin-logout';
import { useNotificationsNodeBuilder } from './plugin-notifications';
import { createReaderNodeBuilder } from './plugin-reader';
import { useShoppingCartPlugin } from './plugin-shopping-cart';
import { buildSiteBadgeNode } from './plugin-site-badges';
import { removeUndrawnStatsNode, useStatsSparklineNodeBuilder } from './plugin-stats-sparkline';
import { buildWpcomAccountNode } from './plugin-wpcom-account';
import { RESPONSIVE_MENU_NODE_ID, trackOmnibarNodes, useRecordOmnibarNodeClick } from './tracking';
import { useOmnibarUser } from './user';
import type { AppConfig } from '../context';
import type { User } from '@automattic/api-core';
import type { OmnibarNode, OmnibarNodeBuilders } from '@automattic/omnibar';
import type { ShoppingCartManagerClient } from '@automattic/shopping-cart';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

function removeUnsupportedNodes( nodes: AdminBarNode[], supports: AppConfig[ 'supports' ] ) {
	// The palette is only mounted where the app supports it, so elsewhere the
	// admin bar's button would open nothing.
	return nodes.filter( ( node ) => node.id !== 'command-palette' || supports.commandPalette );
}

function insertBefore( nodes: OmnibarNode[], node: OmnibarNode | undefined, beforeId: string ) {
	if ( ! node ) {
		return nodes;
	}
	const index = nodes.findIndex( ( { id } ) => id === beforeId );
	return index === -1
		? [ ...nodes, node ]
		: [ ...nodes.slice( 0, index ), node, ...nodes.slice( index ) ];
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
	const { recordTracksEvent } = useAnalytics();
	const recordNodeClick = useRecordOmnibarNodeClick();
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const authUser = useOmnibarUser( { user, enabled: hydrated } );

	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );
	const { data: showAiChat = false } = useQuery( omnibarAgentsManagerEnabledQuery() );

	const { data: { nodes: dashboardNodes } = {} } = useQuery( dashboardAdminBarQuery() );
	const { data: { nodes: siteNodes } = {} } = useQuery( {
		...siteAdminBarQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	const adminBarNodes = useMemo(
		() => addMissingDefaultNodes( siteNodes ?? dashboardNodes ?? [] ),
		[ siteNodes, dashboardNodes ]
	);
	const statsSparklineNodeBuilder = useStatsSparklineNodeBuilder( { site, adminBarNodes } );
	const helpCenterNodeBuilder = useHelpCenterNodeBuilder( { sectionName } );
	const notificationsNodeBuilder = useNotificationsNodeBuilder( { user } );

	const nodeBuilders = useMemo< OmnibarNodeBuilders >(
		() => ( {
			'my-wpcom-account': buildWpcomAccountNode,
			'site-plan-badge': buildSiteBadgeNode,
			'site-status-badge': buildSiteBadgeNode,
			'free-domain-upsell': createFreeDomainUpsellNodeBuilder( { sectionName, recordTracksEvent } ),
			...( statsSparklineNodeBuilder ? { stats: statsSparklineNodeBuilder } : {} ),
			...( authUser ? { logout: createLogoutNodeBuilder( authUser ) } : {} ),
			...( supports.reader ? { reader: createReaderNodeBuilder( { sectionGroup } ) } : {} ),
			...( supports.help ? { 'help-center': helpCenterNodeBuilder } : {} ),
			...( supports.notifications ? { notes: notificationsNodeBuilder } : {} ),
		} ),
		[
			authUser,
			sectionName,
			sectionGroup,
			supports,
			recordTracksEvent,
			statsSparklineNodeBuilder,
			helpCenterNodeBuilder,
			notificationsNodeBuilder,
		]
	);

	const baseOmnibarNodes = useMemo( () => {
		const result = buildOmnibarNodesFromAdminBarNodes(
			removeUndrawnStatsNode(
				removeUnsupportedNodes( adminBarNodes, supports ),
				statsSparklineNodeBuilder
			),
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
	}, [ adminBarNodes, siteNodes, site, supports, nodeBuilders, statsSparklineNodeBuilder ] );

	const { node: languageSwitcherNode, panel: languageSwitcherPanel } = useLanguageSwitcherPlugin( {
		user,
	} );
	const { node: shoppingCartNode, panel: shoppingCartPanel } = useShoppingCartPlugin( { site } );
	const { node: launchSiteNode, panel: launchSitePanel } = useLaunchSitePlugin( { site } );
	const dashboardNode = useDashboardPlugin( { site, sectionGroup } );
	const aiChatPluginNode = buildAiChatPluginNode( {
		enabled: showAiChat,
		sectionName,
		adminBarNodes,
	} );
	const siteNode = addDashboardNode( baseOmnibarNodes.site, dashboardNode );
	const siteActions = [ ...( baseOmnibarNodes.siteActions ?? [] ), launchSiteNode ].filter(
		( node ) => node !== undefined
	);

	const plugins = baseOmnibarNodes.user
		? insertBefore(
				[
					...( languageSwitcherNode ? [ languageSwitcherNode ] : [] ),
					...( shoppingCartNode ? [ shoppingCartNode ] : [] ),
					...( baseOmnibarNodes.plugins ?? [] ),
				],
				aiChatPluginNode,
				'notes'
			)
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

export function InitialOmnibar( {
	user,
	homeIcon = <OmnibarHomeIcon />,
}: {
	user?: User;
	homeIcon?: React.ReactElement;
} ) {
	return (
		<Omnibar
			nodes={ {
				home: {
					id: '',
					icon: homeIcon,
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
