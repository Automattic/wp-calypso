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
import observe from 'lib/mixins/data-observe';
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
import { fetchGoogleAppsProvisionData } from 'state/google-apps-provisioning/actions';
import { getProvisionDataByDomain, provisionDataIsLoaded } from 'state/google-apps-provisioning/selectors';
import { shouldFetchSitePlans } from 'lib/plans';
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
		googleAppsProvisionData: props.googleAppsProvisionData,
		googleAppsProvisionDataLoaded: props.googleAppsProvisionDataLoaded,
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
		googleAppsProvisionData: React.PropTypes.object.isRequired,
		googleAppsProvisionDataLoaded: React.PropTypes.bool.isRequired,
		googleAppsUsers: React.PropTypes.array.isRequired,
		googleAppsUsersLoaded: React.PropTypes.bool.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount() {
		this.loadDomainsAndSitePlans();
		this.props.fetchGoogleAppsProvisionData();
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
			<StoreConnection
				domains={ this.props.domains }
				googleAppsProvisionData={ this.props.googleAppsProvisionData }
				googleAppsProvisionDataLoaded={ this.props.googleAppsProvisionDataLoaded }
				googleAppsUsers={ this.props.googleAppsUsers }
				googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				products={ this.props.productsList.get() }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() }
				sitePlans={ this.props.sitePlans }
				context={ this.props.context } />
		);
	}
} );

export default connect(
	( state, { selectedDomainName, sites } ) => {
		const googleAppsProvisionData = getProvisionDataByDomain( state );
		const googleAppsUsers = selectedDomainName
			? getByDomain( state, selectedDomainName )
			: getBySite( state, sites.getSelectedSite().ID );

		return {
			googleAppsProvisionData,
			googleAppsProvisionDataLoaded: provisionDataIsLoaded( state ),
			googleAppsUsers,
			googleAppsUsersLoaded: isLoaded( state ),
			sitePlans: getPlansBySite( state, sites.getSelectedSite() )
		}
	},
	( dispatch, { selectedDomainName, sites } ) => {
		const googleAppsProvisionFetcher = () => fetchGoogleAppsProvisionData( selectedDomainName );
		const googleAppsUsersFetcher = selectedDomainName
			? () => fetchByDomain( selectedDomainName )
			: () => fetchBySiteId( sites.getSelectedSite().ID );

		return {
			fetchGoogleAppsUsers: () => dispatch( googleAppsUsersFetcher() ),
			fetchGoogleAppsProvisionData: () => dispatch( googleAppsProvisionFetcher() ),
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		}
	}
)( EmailData );
