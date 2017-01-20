/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingConnections as isRequestingConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class QueryPublicizeConnections extends Component {
	componentWillMount() {
		if ( ! this.props.requestingConnections && this.props.siteId ) {
			this.props.requestConnections( this.props.siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingConnections ||
				! nextProps.siteId ||
				( this.props.siteId === nextProps.siteId ) ) {
			return;
		}

		nextProps.requestConnections( nextProps.siteId );
	}

	render() {
		return null;
	}
}

QueryPublicizeConnections.propTypes = {
	siteId: PropTypes.number,
	requestingConnections: PropTypes.bool,
	requestConnections: PropTypes.func
};

QueryPublicizeConnections.defaultProps = {
	requestConnections: () => {}
};

export default connect(
	( state, { siteId } ) => {
		siteId = siteId || getSelectedSiteId( state );

		return {
			requestingConnections: isRequestingConnections( state, siteId ),
			siteId,
		};
	},
	{
		requestConnections,
	}
)( QueryPublicizeConnections );
