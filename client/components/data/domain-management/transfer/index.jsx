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
import { fetchDomains, fetchWapiDomainInfo } from 'lib/upgrades/actions';

const stores = [
	DomainsStore,
	WapiDomainInfoStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
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
		this.loadDomains();
		this.loadWapiDomainInfo();
	},

	componentWillUpdate() {
		this.loadDomains();
		this.loadWapiDomainInfo();
	},

	loadDomains() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	},

	loadWapiDomainInfo() {
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
