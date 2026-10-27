import {
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getSiteDisplayName } from '../../utils/site-name';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import { createHrefResolver, preferDashboardAdminBarNodes } from './admin-bar-nodes';
import { omnibarEvents } from './events';
import { OmnibarHomeIcon } from './home';
import { useAiChatNode } from './node-ai-chat';
import { addDashboardNode } from './node-dashboard';
import { createFreeDomainUpsellNodeBuilder } from './node-free-domain-upsell';
import { useHelpCenterNodeBuilder } from './node-help-center';
import { useLanguageSwitcherNode } from './node-language-switcher';
import { useLaunchSiteNodeBuilder } from './node-launch-site';
import { createLogoutNodeBuilder } from './node-logout';
import { useNotificationsNodeBuilder } from './node-notifications';
import { createReaderNodeBuilder } from './node-reader';
import { useShoppingCartNode } from './node-shopping-cart';
import { createSiteBadgeNodeBuilder } from './node-site-badges';
import { createStatsSparklineNodeBuilder } from './node-stats-sparkline';
import { createWpcomAccountNodeBuilder } from './node-wpcom-account';
import { RESPONSIVE_MENU_NODE_ID, trackOmnibarNodes, useRecordOmnibarNodeClick } from './tracking';
import { useOmnibarUser } from './user';
import type { User } from '@automattic/api-core';
import type { OmnibarNode, OmnibarNodeBuilders } from '@automattic/omnibar';
import type { ShoppingCartManagerClient } from '@automattic/shopping-cart';

const onClickResponsiveMenu = () => omnibarEvents.mobileMenu.emit();

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

	const { data: { nodes: dashboardAdminBarNodes } = {} } = useQuery( dashboardAdminBarQuery() );
	const { data: { nodes: siteAdminBarNodes } = {} } = useQuery( {
		...siteAdminBarQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	const adminBarNodes = useMemo(
		() =>
			preferDashboardAdminBar
				? preferDashboardAdminBarNodes( dashboardAdminBarNodes, siteAdminBarNodes )
				: ( siteAdminBarNodes ?? dashboardAdminBarNodes ?? [] ),
		[ preferDashboardAdminBar, dashboardAdminBarNodes, siteAdminBarNodes ]
	);

	const { nodeBuilder: launchSiteNodeBuilder, panel: launchSitePanel } = useLaunchSiteNodeBuilder( {
		site,
	} );

	const { nodeBuilder: helpCenterNodeBuilder } = useHelpCenterNodeBuilder( { sectionName } );
	const { nodeBuilder: notificationsNodeBuilder } = useNotificationsNodeBuilder( { user } );

	const nodeBuilders = useMemo< OmnibarNodeBuilders >(
		() => ( {
			'site-plan-badge': createSiteBadgeNodeBuilder(),
			'site-status-badge': createSiteBadgeNodeBuilder(),
			'free-domain-upsell': createFreeDomainUpsellNodeBuilder( { sectionName, recordTracksEvent } ),
			stats: createStatsSparklineNodeBuilder( { siteId } ),
			'launch-site': launchSiteNodeBuilder,
			...( supports.commandPalette ? {} : { 'command-palette': () => null } ),
			reader: supports.reader ? createReaderNodeBuilder( { sectionGroup } ) : () => null,
			'help-center': supports.help ? helpCenterNodeBuilder : () => null,
			notes: supports.notifications ? notificationsNodeBuilder : () => null,
			'my-wpcom-account': createWpcomAccountNodeBuilder(),
			...( authUser ? { logout: createLogoutNodeBuilder( authUser ) } : {} ),
		} ),
		[
			siteId,
			sectionGroup,
			sectionName,
			recordTracksEvent,
			supports,
			launchSiteNodeBuilder,
			helpCenterNodeBuilder,
			notificationsNodeBuilder,
			authUser,
		]
	);

	const baseOmnibarNodes = useMemo( () => {
		const result = buildOmnibarNodesFromAdminBarNodes(
			adminBarNodes,
			nodeBuilders,
			createHrefResolver( siteAdminBarNodes ? site?.options?.admin_url : undefined )
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
	}, [ adminBarNodes, siteAdminBarNodes, site, nodeBuilders ] );

	const siteNode = addDashboardNode( baseOmnibarNodes.site, { site, sectionGroup } );

	const { node: languageSwitcherNode, panel: languageSwitcherPanel } = useLanguageSwitcherNode( {
		user,
	} );
	const { node: shoppingCartNode, panel: shoppingCartPanel } = useShoppingCartNode( { site } );
	const { node: aiChatNode } = useAiChatNode( { sectionName, adminBarNodes } );

	const findUserNode = ( id: string ) =>
		baseOmnibarNodes.userNodes?.find( ( node ) => node.id === id );

	const userNodes = baseOmnibarNodes.user
		? [
				languageSwitcherNode,
				shoppingCartNode,
				findUserNode( 'reader' ),
				findUserNode( 'help-center' ),
				aiChatNode,
				findUserNode( 'notes' ),
			].filter( ( node ): node is OmnibarNode => !! node )
		: [];

	const omnibarNodes = trackOmnibarNodes(
		{
			...baseOmnibarNodes,
			site: siteNode,
			userNodes,
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
