/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import SiteRedirectStore from 'lib/domains/site-redirect/store';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [
	SiteRedirectStore
];

function getStateFromStores( props ) {
	return {
		location: SiteRedirectStore.getBySite( props.selectedSite.domain ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

class SiteRedirectData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired
	};

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite } />
		);
	}
}

export default connect( ( state ) => {
	return {
		selectedSite: getSelectedSite( state )
	};
} )( SiteRedirectData );
