/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingStoreSetupData } from 'state/store-setup/selectors';
import { fetchStoreSetupData as requestStoreSetupData } from 'state/store-setup/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class QueryStoreSetup extends Component {
	componentDidMount() {
		if ( ! this.props.requestingStoreSetupData && this.props.siteId ) {
			this.props.requestStoreSetupData( this.props.siteId );
		}
	}

	componentDidUpdate( { siteId } ) {
		if (
			this.props.siteId &&
			siteId !== this.props.siteId &&
			! this.props.requestingStoreSetupData
		) {
			this.props.requestStoreSetupData( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryStoreSetup.propTypes = {
	requestStoreSetupData: PropTypes.func,
	requestingStoreSetupData: PropTypes.bool,
	siteId: PropTypes.number,
};

QueryStoreSetup.defaultProps = {
	requestStoreSetupData: () => {},
	requestingStoreSetupData: false,
	siteId: 0,
};
export default connect(
	( state, { siteId } ) => {
		siteId = getSelectedSiteId( state );

		return {
			requestingStoreSetupData: isRequestingStoreSetupData( state, siteId ),
			siteId,
		};
	},
	{
		requestStoreSetupData,
	}
)( QueryStoreSetup );
