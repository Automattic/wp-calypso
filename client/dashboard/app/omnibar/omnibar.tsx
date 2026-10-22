import {
	dashboardAdminBarQuery,
	omnibarAgentsManagerEnabledQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { dashboardLink, wpcomLink } from '../../utils/link';
import { getSiteDisplayName } from '../../utils/site-name';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { buildAiChatPluginNode } from './plugin-ai-chat';
import { addDashboardNode, useDashboardPlugin } from './plugin-dashboard';
import { createFreeDomainUpsellNodeBuilder } from './plugin-free-domain-upsell-experiment';
import { useHelpCenterNodeBuilder } from './plugin-help-center';
import { useLanguageSwitcherPlugin } from './plugin-language-switcher';
import { useLaunchSiteNodeBuilder } from './plugin-launch-site';
import { createLogoutNodeBuilder } from './plugin-logout';
import { useNotificationsNodeBuilder } from './plugin-notifications';
import { createReaderNodeBuilder } from './plugin-reader';
import { useShoppingCartPlugin } from './plugin-shopping-cart';
import { buildSiteBadgeNode } from './plugin-site-badges';
import { createStatsSparklineNodeBuilder } from './plugin-stats-sparkline';
import { buildWpcomAccountNode } from './plugin-wpcom-account';
import { RESPONSIVE_MENU_NODE_ID, trackOmnibarNodes, useRecordOmnibarNodeClick } from './tracking';
import { useOmnibarUser } from './user';
import type { User } from '@automattic/api-core';
import type { AdminBarNode, OmnibarNode, OmnibarNodeBuilders } from '@automattic/omnibar';
import type { ShoppingCartManagerClient } from '@automattic/shopping-cart';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

function getSubtreeIds( nodes: AdminBarNode[], rootIds: string[] ) {
	const ids = new Set(
		nodes.filter( ( node ) => rootIds.includes( node.id ) ).map( ( { id } ) => id )
	);

	let found = true;
	while ( found ) {
		found = false;
		for ( const node of nodes ) {
			if ( node.parent && ids.has( node.parent ) && ! ids.has( node.id ) ) {
				ids.add( node.id );
				found = true;
			}
		}
	}
	return ids;
}

function preferDashboardNodes(
	dashboardNodes: AdminBarNode[] | undefined,
	siteNodes: AdminBarNode[] | undefined
) {
	if ( ! dashboardNodes || ! siteNodes ) {
		return siteNodes ?? dashboardNodes ?? [];
	}

	const dashboardRootIds = dashboardNodes
		.filter( ( node ) => node.id === 'wp-logo' || node.parent === 'top-secondary' )
		.map( ( { id } ) => id );
	const dashboardSubtreeIds = getSubtreeIds( dashboardNodes, dashboardRootIds );
	const siteSubtreeIds = getSubtreeIds( siteNodes, dashboardRootIds );

	return [
		...siteNodes.filter( ( node ) => ! siteSubtreeIds.has( node.id ) ),
		...dashboardNodes.filter( ( node ) => dashboardSubtreeIds.has( node.id ) ),
	];
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
	preferDashboardAdminBar = false,
}: {
	user?: User;
	cartManagerClient: ShoppingCartManagerClient;
	sectionGroup?: string;
	sectionName?: string;
	preferDashboardAdminBar?: boolean;
} ) {
	return (
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<ConnectedOmnibar
				user={ user }
				sectionGroup={ sectionGroup }
				sectionName={ sectionName }
				preferDashboardAdminBar={ preferDashboardAdminBar }
			/>
		</ShoppingCartProvider>
	);
}

function ConnectedOmnibar( {
	user,
	sectionGroup,
	sectionName,
	preferDashboardAdminBar,
}: {
	user?: User;
	sectionGroup?: string;
	sectionName?: string;
	preferDashboardAdminBar: boolean;
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
		() =>
			preferDashboardAdminBar
				? preferDashboardNodes( dashboardNodes, siteNodes )
				: ( siteNodes ?? dashboardNodes ?? [] ),
		[ preferDashboardAdminBar, dashboardNodes, siteNodes ]
	);
	const helpCenterNodeBuilder = useHelpCenterNodeBuilder( { sectionName } );
	const notificationsNodeBuilder = useNotificationsNodeBuilder( { user } );
	const { nodeBuilder: launchSiteNodeBuilder, panel: launchSitePanel } = useLaunchSiteNodeBuilder( {
		site,
	} );

	const nodeBuilders = useMemo< OmnibarNodeBuilders >(
		() => ( {
			'my-wpcom-account': buildWpcomAccountNode,
			'site-plan-badge': buildSiteBadgeNode,
			'site-status-badge': buildSiteBadgeNode,
			'free-domain-upsell': createFreeDomainUpsellNodeBuilder( { sectionName, recordTracksEvent } ),
			stats: createStatsSparklineNodeBuilder( { siteId } ),
			'launch-site': launchSiteNodeBuilder,
			...( supports.commandPalette ? {} : { 'command-palette': () => null } ),
			...( authUser ? { logout: createLogoutNodeBuilder( authUser ) } : {} ),
			reader: supports.reader ? createReaderNodeBuilder( { sectionGroup } ) : () => null,
			'help-center': supports.help ? helpCenterNodeBuilder : () => null,
			notes: supports.notifications ? notificationsNodeBuilder : () => null,
		} ),
		[
			authUser,
			siteId,
			sectionName,
			sectionGroup,
			supports,
			recordTracksEvent,
			helpCenterNodeBuilder,
			notificationsNodeBuilder,
			launchSiteNodeBuilder,
		]
	);

	const baseOmnibarNodes = useMemo( () => {
		const result = buildOmnibarNodesFromAdminBarNodes(
			adminBarNodes,
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
	}, [ adminBarNodes, siteNodes, site, nodeBuilders ] );

	const { node: languageSwitcherNode, panel: languageSwitcherPanel } = useLanguageSwitcherPlugin( {
		user,
	} );
	const { node: shoppingCartNode, panel: shoppingCartPanel } = useShoppingCartPlugin( { site } );
	const dashboardNode = useDashboardPlugin( { site, sectionGroup } );
	const aiChatPluginNode = buildAiChatPluginNode( {
		enabled: showAiChat,
		sectionName,
		adminBarNodes,
	} );
	const siteNode = addDashboardNode( baseOmnibarNodes.site, dashboardNode );
	const findPluginNode = ( id: string ) =>
		baseOmnibarNodes.userPlugins?.find( ( node ) => node.id === id );

	const userPlugins = baseOmnibarNodes.user
		? [
				languageSwitcherNode,
				shoppingCartNode,
				findPluginNode( 'reader' ),
				findPluginNode( 'help-center' ),
				aiChatPluginNode,
				findPluginNode( 'notes' ),
			].filter( ( node ): node is OmnibarNode => !! node )
		: [];

	const omnibarNodes = trackOmnibarNodes(
		{
			...baseOmnibarNodes,
			site: siteNode,
			userPlugins,
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
