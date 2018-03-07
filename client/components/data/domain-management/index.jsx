/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DomainsStore from 'lib/domains/store';
import CartStore from 'lib/cart/store';
import { fetchDomains } from 'lib/upgrades/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getProductsList } from 'state/products-list/selectors';
import QueryProducts from 'components/data/query-products-list';

const stores = [ DomainsStore, CartStore ];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: props.selectedSite ? DomainsStore.getBySite( props.selectedSite.ID ) : null,
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
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object.isRequired,
	};

	componentWillMount() {
		const { selectedSite } = this.props;

		if ( selectedSite ) {
			fetchDomains( selectedSite.ID );
		}
	}

	componentWillUpdate( nextProps ) {
		const { selectedSite: prevSite } = this.props;
		const { selectedSite: nextSite } = nextProps;

		if ( nextSite && nextSite !== prevSite ) {
			fetchDomains( nextSite.ID );
		}
	}

	render() {
		return (
			<Fragment>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				<QueryProducts />
				{ this.props.selectedSite && <QuerySitePlans siteId={ this.props.selectedSite.ID } /> }
				<QueryContactDetailsCache />
				<StoreConnection
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.productsList }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
					context={ this.props.context }
				/>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );

	return {
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
		productsList: getProductsList( state ),
	};
};

export default connect( mapStateToProps )( DomainManagementData );
