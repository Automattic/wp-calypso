/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DnsStore from 'lib/domains/dns/store';
import DomainsStore from 'lib/domains/store';
import upgradesActions from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [
	DomainsStore,
	DnsStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		dns: DnsStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

export class DnsData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.loadDns();
	}

	componentWillUpdate() {
		this.loadDns();
	}

	loadDns = () => {
		upgradesActions.fetchDns( this.props.selectedDomainName );
	};

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

const mapStateToProps = state => ( {
	selectedSite: getSelectedSite( state ),
} );

export default connect( mapStateToProps )( DnsData );
