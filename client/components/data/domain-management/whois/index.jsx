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
import { getSelectedSite } from 'state/ui/selectors';
import StoreConnection from 'components/data/store-connection';
import { fetchWhois } from 'lib/upgrades/actions';
import WhoisStore from 'lib/domains/whois/store';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import QuerySiteDomains from 'components/data/query-site-domains';

const stores = [ WhoisStore ];

function getStateFromStores( props ) {
	return {
		domains: props.domains,
		isRequestingSiteDomains: props.isRequestingSiteDomains,
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
		this.loadWhois();
	}

	componentWillUpdate() {
		this.loadWhois();
	}

	loadWhois() {
		fetchWhois( this.props.selectedDomainName );
	}

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<StoreConnection
					component={ this.props.component }
					context={ this.props.context }
					domains={ this.props.domains }
					getStateFromStores={ getStateFromStores }
					isRequestingSiteDomains={ this.props.requestingSiteDomains }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ selectedSite }
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
} )( WhoisData );
