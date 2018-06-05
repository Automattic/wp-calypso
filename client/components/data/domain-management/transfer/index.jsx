/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import UsersStore from 'lib/users/store';
import { fetchUsers } from 'lib/users/actions';
import { fetchWapiDomainInfo } from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import QuerySiteDomains from 'components/data/query-site-domains';

const stores = [ WapiDomainInfoStore, UsersStore ];

function getStateFromStores( props ) {
	let users;

	if ( props.selectedSite ) {
		users = UsersStore.getUsers( { siteId: props.selectedSite.ID } );
	}

	return {
		domains: props.domains,
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		users,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		wapiDomainInfo: WapiDomainInfoStore.getByDomainName( props.selectedDomainName ),
	};
}

class TransferData extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		component: PropTypes.func.isRequired,
		domains: PropTypes.array,
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
			fetchUsers( { siteId: selectedSite.ID, number: 1000 } );

			this.prevSelectedSite = selectedSite;
		}
		fetchWapiDomainInfo( this.props.selectedDomainName );
	}

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<StoreConnection
					component={ this.props.component }
					domains={ this.props.domains }
					isRequestingSiteDomains={ this.props.requestingSiteDomains }
					getStateFromStores={ getStateFromStores }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					stores={ stores }
				/>
			</div>
		);
	}
}

export default connect( state => {
	const selectedSite = getSelectedSite( state );
	const siteId = get( selectedSite, 'ID', null );

	return {
		domains: getDomainsBySiteId( state, siteId ),
		requestingSiteDomains: isRequestingSiteDomains( state, siteId ),
		selectedSite,
	};
} )( TransferData );
