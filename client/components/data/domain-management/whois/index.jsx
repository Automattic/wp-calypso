/** @format */
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
import { fetchDomains, fetchWhois } from 'lib/upgrades/actions';
import WhoisStore from 'lib/domains/whois/store';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const stores = [ DomainsStore, WhoisStore ];

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
		context: props.context,
	};
}

class WhoisData extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		component: PropTypes.func.isRequired,
		context: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
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
			fetchDomains( selectedSite.ID );

			this.prevSelectedSite = selectedSite;
		}
	}

	loadWhois() {
		fetchWhois( this.props.selectedDomainName );
	}

	render() {
		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				<StoreConnection
					component={ this.props.component }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					context={ this.props.context }
				/>
			</div>
		);
	}
}

export default connect( state => {
	return {
		selectedSite: getSelectedSite( state ),
	};
} )( WhoisData );
