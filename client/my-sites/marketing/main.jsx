/** @format */

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
import config from 'config';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import DocumentHead from 'components/data/document-head';
import { getSiteSlug, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradeNudge from 'blocks/upgrade-nudge';
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
	siteSlug,
	translate,
} ) => {
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	const filters = [];

	if ( config.isEnabled( 'marketing/tools' ) ) {
		filters.push( {
			id: 'marketing-tools',
			route: '/marketing/tools' + pathSuffix,
			title: translate( 'Marketing Tools' ),
		} );
	}

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
			<DocumentHead title={ translate( 'Sharing' ) } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<SidebarNavigation />
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
			<UpgradeNudge
				event="sharing_no_ads"
				feature={ FEATURE_NO_ADS }
				message={ translate( 'Prevent ads from showing on your site.' ) }
				title={ translate( 'No Ads with WordPress.com Premium' ) }
			/>
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	canManageOptions: PropTypes.bool,
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
	const hasSharedaddy =
		isJetpackModuleActive( state, siteId, 'sharedaddy' ) &&
		isJetpackMinimumVersion( state, siteId, '3.4-dev' );

	return {
		showButtons: siteId && canManageOptions && ( ! isJetpack || hasSharedaddy ),
		showConnections: ! siteId || ! isJetpack || isJetpackModuleActive( state, siteId, 'publicize' ),
		showTraffic: !! siteId,
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( Sharing ) );
