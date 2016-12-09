/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainsStore from 'lib/domains/store';
import StoreConnection from 'components/data/store-connection';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import UsersStore from 'lib/users/store';
import { fetchUsers } from 'lib/users/actions';
import { fetchDomains, fetchWapiDomainInfo } from 'lib/upgrades/actions';

const stores = [
	DomainsStore,
	WapiDomainInfoStore,
	UsersStore
];

function getStateFromStores( props ) {
	let domains, users;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
		users = UsersStore.getUsers( { siteId: props.selectedSite.ID } );
	}

	return {
		domains,
		users,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		wapiDomainInfo: WapiDomainInfoStore.getByDomainName( props.selectedDomainName )
	};
}

const TransferData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	componentWillMount() {
		this.loadData();
	},

	componentWillUpdate() {
		this.loadData();
	},

	loadData() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			fetchDomains( selectedSite.ID );
			fetchUsers( { siteId: selectedSite.ID } );

			this.prevSelectedSite = selectedSite;
		}
		fetchWapiDomainInfo( this.props.selectedDomainName );
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );

export default TransferData;
