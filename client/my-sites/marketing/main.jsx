/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import canCurrentUser from 'state/selectors/can-current-user';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isVipSite from 'state/selectors/is-vip-site';
import DocumentHead from 'components/data/document-head';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import UpsellNudge from 'blocks/upsell-nudge';
import { FEATURE_NO_ADS } from 'lib/plans/constants';

/**
 * Style Dependencies
 */
import './style.scss';

export const Sharing = ( {
	contentComponent,
	path,
	showButtons,
	showConnections,
	showTraffic,
	siteId,
	isVip,
	siteSlug,
	translate,
} ) => {
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	const filters = [];

	filters.push( {
		id: 'marketing-tools',
		route: '/marketing/tools' + pathSuffix,
		title: translate( 'Marketing Tools' ),
	} );

	// Include SEO link if a site is selected and the
	// required Jetpack module is active
	if ( showTraffic ) {
		filters.push( {
			id: 'traffic',
			route: '/marketing/traffic' + pathSuffix,
			title: translate( 'Traffic' ),
		} );
	}

	// Include Connections link if all sites are selected. Otherwise,
	// verify that the required Jetpack module is active
	if ( showConnections ) {
		filters.push( {
			id: 'sharing-connections',
			route: '/marketing/connections' + pathSuffix,
			title: translate( 'Connections' ),
		} );
	}

	// Include Sharing Buttons link if a site is selected and the
	// required Jetpack module is active
	if ( showButtons ) {
		filters.push( {
			id: 'sharing-buttons',
			route: '/marketing/sharing-buttons' + pathSuffix,
			title: translate( 'Sharing Buttons' ),
		} );
	}

	const selected = find( filters, { route: path } );

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="sharing">
			<DocumentHead title={ translate( 'Marketing and Integrations' ) } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<SidebarNavigation />
			<FormattedHeader
				className="marketing__page-heading"
				headerText={ translate( 'Marketing and Integrations' ) }
				align="left"
			/>
			{ filters.length > 0 && (
				<SectionNav selectedText={ get( selected, 'title', '' ) }>
					<NavTabs>
						{ filters.map( ( { id, route, title } ) => (
							<NavItem key={ id } path={ route } selected={ path === route }>
								{ title }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
			) }
			{ ! isVip && (
				<UpsellNudge
					event="sharing_no_ads"
					feature={ FEATURE_NO_ADS }
					description={ translate( 'Prevent ads from showing on your site.' ) }
					title={ translate( 'No Ads with WordPress.com Premium' ) }
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
					showIcon={ true }
				/>
			) }
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	canManageOptions: PropTypes.bool,
	isVipSite: PropTypes.bool,
	contentComponent: PropTypes.node,
	path: PropTypes.string,
	showButtons: PropTypes.bool,
	showConnections: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	translate: PropTypes.func,
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const hasSharedaddy = isJetpackModuleActive( state, siteId, 'sharedaddy' );

	return {
		showButtons: siteId && canManageOptions && ( ! isJetpack || hasSharedaddy ),
		showConnections: !! siteId,
		showTraffic: canManageOptions && !! siteId,
		isVip: isVipSite( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( Sharing ) );
