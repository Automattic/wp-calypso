/**
 * External dependencies
 */
import React from 'react';
import partial from 'lodash/partial';
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
	getLoaded
} from 'state/google-apps-users/selectors';
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
		sites: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.array.isRequired,
		googleAppsUsersLoaded: React.PropTypes.bool.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount() {
		this.loadDomains();
		this.props.fetch();
	},

	componentWillUpdate() {
		this.loadDomains();
	},

	loadDomains() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	},

	render() {
		return (
			<StoreConnection
				domains={ this.props.domains }
				googleAppsUsers={ this.props.googleAppsUsers }
				googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				products={ this.props.productsList.get() }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() }
				context={ this.props.context } />
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		let usersGetter;
		if ( ownProps.selectedDomainName ) {
			usersGetter = partial( getByDomain, state, ownProps.selectedDomainName );
		} else {
			usersGetter = partial( getBySite, state, ownProps.sites.getSelectedSite().ID );
		}
		return {
			googleAppsUsers: usersGetter(),
			googleAppsUsersLoaded: getLoaded( state )
		}
	},
	( dispatch, ownProps ) => {
		let usersFetcher;
		if ( ownProps.selectedDomainName ) {
			usersFetcher = partial( fetchByDomain, ownProps.selectedDomainName );
		} else {
			usersFetcher = partial( fetchBySiteId, ownProps.sites.getSelectedSite().ID );
		}
		return {
			fetch: () => dispatch( usersFetcher() )
		}
	}
)( EmailData );
