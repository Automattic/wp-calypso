/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import observe from 'lib/mixins/data-observe';
import DomainsStore from 'lib/domains/store';
import { fetchDomains } from 'lib/upgrades/actions/domain-management';

var stores = [
	DomainsStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		context: props.context,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

module.exports = React.createClass( {
	displayName: 'EditSiteAddressData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		context: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'productsList' ) ],

	componentWillMount() {
		this.loadDomains();
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
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() }
				context={ this.props.context } />
		);
	}
} );
