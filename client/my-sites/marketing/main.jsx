import { FEATURE_NO_ADS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { find, get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

export const Sharing = ( {
	contentComponent,
	pathname,
	showButtons,
	showConnections,
	showTraffic,
	showBusinessTools,
	siteId,
	isJetpack,
	isP2Hub,
	isVip,
	siteSlug,
	translate,
} ) => {
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	let filters = [];

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
	const connectionsFilter = {
		id: 'sharing-connections',
		route: '/marketing/connections' + pathSuffix,
		title: translate( 'Connections' ),
	};
	if ( showConnections ) {
		filters.push( connectionsFilter );
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

	// Include Business Tools link if a site is selected and the
	// site is not VIP
	if ( ! isVip && showBusinessTools ) {
		filters.push( {
			id: 'business-buttons',
			route: '/marketing/business-tools' + pathSuffix,
			title: translate( 'Business Tools' ),
		} );
	}

	// For p2 hub sites show only connections tab
	let titleHeader = translate( 'Marketing and Integrations' );
	let description = translate(
		'Explore tools to build your audience, market your site, and engage your visitors.'
	);
	if ( isP2Hub ) {
		filters = [ connectionsFilter ];
		titleHeader = translate( 'Integrations' );
		description = translate( 'Explore tools to connect to your P2.' );
	}

	const selected = find( filters, { route: pathname } );
	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="sharing">
			<DocumentHead title={ titleHeader } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<FormattedHeader
				brandFont
				className="marketing__page-heading"
				headerText={ titleHeader }
				subHeaderText={ description }
				align="left"
			/>
			{ filters.length > 0 && (
				<SectionNav selectedText={ get( selected, 'title', '' ) }>
					<NavTabs>
						{ filters.map( ( { id, route, title } ) => (
							<NavItem key={ id } path={ route } selected={ pathname === route }>
								{ title }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
			) }
			{ ! isVip && ! isJetpack && (
				<UpsellNudge
					event="sharing_no_ads"
					feature={ FEATURE_NO_ADS }
					description={ translate( 'Prevent ads from showing on your site.' ) }
					title={ translate( 'No ads with WordPress.com Pro' ) }
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
	showBusinessTools: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	translate: PropTypes.func,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const isAtomic = isSiteWpcomAtomic( state, siteId );
	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	return {
		isP2Hub: isSiteP2Hub( state, siteId ),
		showButtons: siteId && canManageOptions,
		showConnections: !! siteId,
		showTraffic: canManageOptions && !! siteId,
		showBusinessTools: ( !! siteId && canManageOptions && ! isJetpack ) || isAtomic,
		isVip: isVipSite( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isJetpack: isJetpack,
	};
} )( localize( Sharing ) );
