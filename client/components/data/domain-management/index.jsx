/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getPlansBySite } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

class DomainManagementData extends React.Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		context: PropTypes.object.isRequired,
		domains: PropTypes.array,
		isRequestingSiteDomains: PropTypes.bool,
		needsContactDetails: PropTypes.bool,
		needsDns: PropTypes.bool,
		needsDomains: PropTypes.bool,
		needsPlans: PropTypes.bool,
		needsProductsList: PropTypes.bool,
		productsList: PropTypes.object,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object,
	};

	render() {
		const {
			needsContactDetails,
			needsDomains,
			needsPlans,
			needsProductsList,
			selectedSite,
		} = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && needsContactDetails && <QueryContactDetailsCache /> }
				{ selectedSite && needsDomains && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				{ selectedSite && needsPlans && <QuerySitePlans siteId={ selectedSite.ID } /> }
				{ needsProductsList && <QueryProductsList /> }

				<CalypsoShoppingCartProvider>
					{ React.createElement( this.props.component, {
						context: this.props.context,
						domains: selectedSite ? this.props.domains : null,
						hasSiteDomainsLoaded: this.props.hasSiteDomainsLoaded,
						isRequestingSiteDomains: this.props.isRequestingSiteDomains,
						products: this.props.products,
						selectedDomainName: this.props.selectedDomainName,
						selectedSite,
						sitePlans: this.props.sitePlans,
						user: this.props.currentUser,
					} ) }
				</CalypsoShoppingCartProvider>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const siteId = get( selectedSite, 'ID', null );

	return {
		currentUser: getCurrentUser( state ),
		domains: getDomainsBySiteId( state, siteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
		isRequestingSiteDomains: isRequestingSiteDomains( state, siteId ),
		productsList: getProductsList( state ),
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
} )( DomainManagementData );
