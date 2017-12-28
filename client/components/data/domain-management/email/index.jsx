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
import StoreConnection from 'client/components/data/store-connection';
import DomainsStore from 'client/lib/domains/store';
import CartStore from 'client/lib/cart/store';
import QueryProducts from 'client/components/data/query-products-list';
import QuerySites from 'client/components/data/query-sites';
import { fetchDomains } from 'client/lib/upgrades/actions';
import userFactory from 'client/lib/user';
import { fetchByDomain, fetchBySiteId } from 'client/state/google-apps-users/actions';
import { getByDomain, getBySite, isLoaded } from 'client/state/google-apps-users/selectors';
import { shouldFetchSitePlans } from 'client/lib/plans';
import { fetchSitePlans } from 'client/state/sites/plans/actions';
import { getPlansBySite } from 'client/state/sites/plans/selectors';
import { getSelectedSite } from 'client/state/ui/selectors';
import { getProductsList } from 'client/state/products-list/selectors';

const user = userFactory();

const stores = [ DomainsStore, CartStore ];

function getStateFromStores( props ) {
	return {
		domains: DomainsStore.getBySite( props.selectedSite.ID ) || {},
		cart: CartStore.get(),
		context: props.context,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
		user: user.get(),
		googleAppsUsers: props.googleAppsUsers,
		googleAppsUsersLoaded: props.googleAppsUsersLoaded,
	};
}

class EmailData extends React.Component {
	static displayName = 'EmailData';

	static propTypes = {
		component: PropTypes.func.isRequired,
		context: PropTypes.object.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object.isRequired,
		sitePlans: PropTypes.object.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		googleAppsUsersLoaded: PropTypes.bool.isRequired,
	};

	componentWillMount() {
		const { selectedSite } = this.props;

		this.loadDomainsAndSitePlans( selectedSite );
		this.props.fetchGoogleAppsUsers( selectedSite.ID );
	}

	componentWillUpdate( nextProps ) {
		const { selectedSite: nextSite } = nextProps;
		const { selectedSite: prevSite } = this.props;

		if ( nextSite !== prevSite ) {
			this.loadDomainsAndSitePlans( nextSite );
		}
	}

	loadDomainsAndSitePlans = site => {
		fetchDomains( site.ID );
		this.props.fetchSitePlans( this.props.sitePlans, site );
	};

	render() {
		return (
			<div>
				<QueryProducts />
				<QuerySites />
				<StoreConnection
					domains={ this.props.domains }
					googleAppsUsers={ this.props.googleAppsUsers }
					googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.products }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
					context={ this.props.context }
				/>
			</div>
		);
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const selectedSite = getSelectedSite( state );
		const googleAppsUsers = selectedDomainName
			? getByDomain( state, selectedDomainName )
			: getBySite( state, selectedSite.ID );

		return {
			googleAppsUsers,
			googleAppsUsersLoaded: isLoaded( state ),
			products: getProductsList( state ),
			sitePlans: getPlansBySite( state, selectedSite ),
			selectedSite,
		};
	},
	( dispatch, { selectedDomainName } ) => {
		const googleAppsUsersFetcher = selectedDomainName
			? () => fetchByDomain( selectedDomainName )
			: siteId => fetchBySiteId( siteId );

		return {
			fetchGoogleAppsUsers: siteId => dispatch( googleAppsUsersFetcher( siteId ) ),
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			},
		};
	}
)( EmailData );
