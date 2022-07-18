import { WPCOM_FEATURES_NO_ADVERTS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
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
	siteId,
	isJetpack,
	isVip,
	siteSlug,
	translate,
} ) => {
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	const filters = [];

	filters.push( {
		id: 'campaigns',
		route: '/campaigns/all' + pathSuffix,
		title: translate( 'All' ),
	} );

	// For p2 hub sites show only connections tab
	const titleHeader = translate( 'Promoted posts' );

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
				subHeaderText={
					selected?.description ?? translate( 'Create, edit, and manage your boosted posts.' )
				}
				align="left"
			/>
			{ filters.length > 0 && (
				<SectionNav selectedText={ selected?.title ?? '' }>
					<NavTabs>
						{ filters.map( ( { id, route, title } ) => (
							<NavItem key={ id } path={ route } selected={ pathname === route }>
								{ title }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
			) }
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	canManageOptions: PropTypes.bool,
	contentComponent: PropTypes.node,
	isVipSite: PropTypes.bool,
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
