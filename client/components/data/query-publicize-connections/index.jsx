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
