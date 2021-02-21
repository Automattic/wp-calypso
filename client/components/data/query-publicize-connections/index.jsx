/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingConnections as isRequestingConnections } from 'calypso/state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'calypso/state/sharing/publicize/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class QueryPublicizeConnections extends Component {
	componentDidMount() {
		if ( ! this.props.requestingConnections && this.props.siteId ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	componentDidUpdate( { siteId } ) {
		if ( this.props.siteId && siteId !== this.props.siteId && ! this.props.requestingConnections ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryPublicizeConnections.propTypes = {
	requestConnections: PropTypes.func,
	requestingConnections: PropTypes.bool,
	selectedSite: PropTypes.bool,
	siteId: PropTypes.number,
};

QueryPublicizeConnections.defaultProps = {
	requestConnections: () => {},
	requestingConnections: false,
	selectedSite: false,
	siteId: 0,
};

export default connect(
	( state, { siteId, selectedSite } ) => {
		siteId = siteId || ( selectedSite && getSelectedSiteId( state ) );

		return {
			requestingConnections: isRequestingConnections( state, siteId ),
			siteId,
		};
	},
	{
		requestConnections,
	}
)( QueryPublicizeConnections );
