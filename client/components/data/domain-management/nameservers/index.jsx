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
import NameserversStore from 'lib/domains/nameservers/store';
import QuerySiteDomains from 'components/data/query-site-domains';
import StoreConnection from 'components/data/store-connection';
import { fetchNameservers } from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';

const stores = [ NameserversStore ];

function getStateFromStores( props ) {
	return {
		domains: props.domains,
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		// undefined is not permitted by the passed component
		// so we have to explicitly choose a bool in that case
		selectedSite: props.selectedSite || false,
	};
}

export class NameserversData extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.loadNameservers();
	}

	componentWillUpdate() {
		this.loadNameservers();
	}

	loadNameservers = () => {
		fetchNameservers( this.props.selectedDomainName );
	};

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<StoreConnection
					component={ this.props.component }
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

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );
	const siteId = get( selectedSite, 'ID', null );

	return {
		domains: getDecoratedSiteDomains( state, siteId ),
		requestingSiteDomains: isRequestingSiteDomains( state, siteId ),
		selectedSite,
	};
};

export default connect( mapStateToProps )( NameserversData );
