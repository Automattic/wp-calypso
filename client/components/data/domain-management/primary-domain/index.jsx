/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DomainsStore from 'lib/domains/store';
import observe from 'lib/mixins/data-observe';

const stores = [
	DomainsStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

export default React.createClass( {
	displayName: 'PrimaryDomainData',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

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
