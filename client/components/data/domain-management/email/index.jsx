/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DomainsStore from 'lib/domains/store';
import CartStore from 'lib/cart/store';
import QueryProducts from 'components/data/query-products-list';
import { fetchDomains } from 'lib/upgrades/actions';
import userFactory from 'lib/user';
import {
	fetchByDomain,
	fetchBySiteId
} from 'state/google-apps-users/actions';
import {
	getByDomain,
	getBySite,
	isLoaded
} from 'state/google-apps-users/selectors';
import { shouldFetchSitePlans } from 'lib/plans';
import { getProductsList } from 'state/products-list/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';

const user = userFactory();

var stores = [
	DomainsStore,
	CartStore
];

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
		googleAppsUsersLoaded: props.googleAppsUsersLoaded
	};
}

const EmailData = React.createClass( {
	displayName: 'EmailData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		context: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		sitePlans: React.PropTypes.object.isRequired,
		sites: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.array.isRequired,
		googleAppsUsersLoaded: React.PropTypes.bool.isRequired
	},

	componentWillMount() {
		this.loadDomainsAndSitePlans();
		this.props.fetchGoogleAppsUsers();
	},

	componentWillUpdate() {
		this.loadDomainsAndSitePlans();
	},

	loadDomainsAndSitePlans() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			fetchDomains( selectedSite.ID );
			this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );

			this.prevSelectedSite = selectedSite;
		}
	},

	render() {
		return (
			<div>
				<QueryProducts />
				<StoreConnection
					domains={ this.props.domains }
					googleAppsUsers={ this.props.googleAppsUsers }
					googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.products }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.sites.getSelectedSite() }
					sitePlans={ this.props.sitePlans }
					context={ this.props.context } />
			</div>
		);
	}
} );

export default connect(
	( state, { selectedDomainName, sites } ) => {
		const googleAppsUsers = selectedDomainName
			? getByDomain( state, selectedDomainName )
			: getBySite( state, sites.getSelectedSite().ID );

		return {
			googleAppsUsers,
			googleAppsUsersLoaded: isLoaded( state ),
			products: getProductsList( state ),
			sitePlans: getPlansBySite( state, sites.getSelectedSite() )
		}
	},
	( dispatch, { selectedDomainName, sites } ) => {
		const googleAppsUsersFetcher = selectedDomainName
			? () => fetchByDomain( selectedDomainName )
			: () => fetchBySiteId( sites.getSelectedSite().ID );

		return {
			fetchGoogleAppsUsers: () => dispatch( googleAppsUsersFetcher() ),
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		}
	}
)( EmailData );
