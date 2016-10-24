/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainsStore from 'lib/domains/store';
import NameserversStore from 'lib/domains/nameservers/store';
import observe from 'lib/mixins/data-observe';
import StoreConnection from 'components/data/store-connection';
import * as upgradesActions from 'lib/upgrades/actions';

const stores = [
	DomainsStore,
	NameserversStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

const NameserversData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		this.loadDomains();
		this.loadNameservers();
	},

	componentWillUpdate() {
		this.loadDomains();
		this.loadNameservers();
	},

	loadDomains() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( this.prevSelectedSite !== selectedSite ) {
			upgradesActions.fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	},

	loadNameservers() {
		upgradesActions.fetchNameservers( this.props.selectedDomainName );
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

export default NameserversData;
