import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import NavigationHeader from 'calypso/components/navigation-header';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import { setExpandedService } from 'calypso/state/sharing/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PanelWithSidebar, Sidebar, SidebarItem } from '../components/panel-sidebar';
import MarketingConnections from './connections';
import MarketingSharing from './sharing';
import MarketingTools from './tools';
import MarketingTraffic from './traffic';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function MarketingSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/marketing/tools/${ slug }` }>{ __( 'Tools' ) }</SidebarItem>
			<SidebarItem href={ `/sites/marketing/connections/${ slug }` }>
				{ __( 'Connections' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/marketing/traffic/${ slug }` }>{ __( 'Traffic' ) }</SidebarItem>
			<SidebarItem href={ `/sites/marketing/sharing-buttons/${ slug }` }>
				{ __( 'Sharing' ) }
			</SidebarItem>
		</Sidebar>
	);
}

export function marketingTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar />
			<div>
				<NavigationHeader
					title={ __( 'Marketing Tools' ) }
					subtitle={ __(
						'Explore tools to build your audience, market your site, and engage your visitors.'
					) }
				/>
				<MarketingTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function marketingConnections( context: PageJSContext, next: () => void ) {
	const { store } = context;
	const { dispatch } = store;
	dispatch( setExpandedService( context.query.service ) );

	const state = store.getState();
	const siteId = getSelectedSiteId( state );
	const isP2Hub = isSiteP2Hub( state, siteId! );

	if ( siteId && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
		dispatch(
			errorNotice( translate( 'You are not authorized to manage sharing settings for this site.' ) )
		);
	}

	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar />
			<MarketingConnections siteId={ siteId! } isP2Hub={ isP2Hub } />
		</PanelWithSidebar>
	);
	next();
}

export function marketingTraffic( context: PageJSContext, next: () => void ) {
	const { store } = context;
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( siteId && ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		store.dispatch(
			errorNotice( translate( 'You are not authorized to manage traffic settings for this site.' ) )
		);
	}

	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar />
			<MarketingTraffic />
		</PanelWithSidebar>
	);
	next();
}

export function marketingSharing( context: PageJSContext, next: () => void ) {
	const { store } = context;
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( siteId && ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		store.dispatch(
			errorNotice( translate( 'You are not authorized to manage sharing settings for this site.' ) )
		);
	}

	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar />
			<MarketingSharing />
		</PanelWithSidebar>
	);
	next();
}
