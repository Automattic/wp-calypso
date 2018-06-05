/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import CartStore from 'lib/cart/store';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getProductsList } from 'state/products-list/selectors';

const stores = [ CartStore ];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: props.selectedSite ? props.domains : null,
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
	};
}

class DomainManagementData extends React.Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		context: PropTypes.object.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object.isRequired,
	};

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				<StoreConnection
					component={ this.props.component }
					context={ this.props.context }
					domains={ this.props.domains }
					getStateFromStores={ getStateFromStores }
					isRequestingSiteDomains={ this.props.requestingSiteDomains }
					products={ this.props.productsList }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
					stores={ stores }
				/>
				{ <QueryProductsList /> }
				{ selectedSite &&
					( <QuerySitePlans siteId={ selectedSite.ID } /> && (
							<QuerySiteDomains siteId={ selectedSite.ID } />
						) && <QueryContactDetailsCache /> ) }
			</div>
		);
	}
}

export default connect( state => {
	const selectedSite = getSelectedSite( state );

	return {
		domains: getDomainsBySiteId( state, selectedSite.ID ),
		requestingSiteDomains: isRequestingSiteDomains( state, selectedSite.ID ),
		productList: getProductsList( state ),
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
} )( DomainManagementData );
