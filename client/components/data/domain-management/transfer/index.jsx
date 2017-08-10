/** @format */
/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainsStore from 'lib/domains/store';
import StoreConnection from 'components/data/store-connection';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import UsersStore from 'lib/users/store';
import { fetchUsers } from 'lib/users/actions';
import { fetchDomains, fetchWapiDomainInfo } from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [ DomainsStore, WapiDomainInfoStore, UsersStore ];

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
		wapiDomainInfo: WapiDomainInfoStore.getByDomainName( props.selectedDomainName ),
	};
}

class TransferData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	componentWillMount() {
		this.loadData();
	}

	componentWillUpdate() {
		this.loadData();
	}

	loadData() {
		const selectedSite = this.props.selectedSite;

		if ( this.prevSelectedSite !== selectedSite ) {
			fetchDomains( selectedSite.ID );
			fetchUsers( { siteId: selectedSite.ID, number: 1000 } );

			this.prevSelectedSite = selectedSite;
		}
		fetchWapiDomainInfo( this.props.selectedDomainName );
	}

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite }
			/>
		);
	}
}

export default connect( state => {
	return {
		selectedSite: getSelectedSite( state ),
	};
} )( TransferData );
