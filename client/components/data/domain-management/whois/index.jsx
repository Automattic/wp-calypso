/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import DomainsStore from 'lib/domains/store';
import StoreConnection from 'components/data/store-connection';
import upgradesActions from 'lib/upgrades/actions';
import WhoisStore from 'lib/domains/whois/store';

const stores = [
	DomainsStore,
	WhoisStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		whois: WhoisStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		context: props.context
	};
}

class WhoisData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		context: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired
	};

	componentWillMount() {
		this.loadDomains();
		this.loadWhois();
	}

	componentWillUpdate() {
		this.loadDomains();
		this.loadWhois();
	}

	loadDomains() {
		const selectedSite = this.props.selectedSite;

		if ( this.prevSelectedSite !== selectedSite ) {
			upgradesActions.fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	}

	loadWhois() {
		upgradesActions.fetchWhois( this.props.selectedDomainName );
	}

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite }
				context={ this.props.context } />
		);
	}
}

export default connect( ( state ) => {
	return {
		selectedSite: getSelectedSite( state )
	};
} )( WhoisData );
