/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteConnectionStatus } from 'state/selectors';
import { requestConnectionStatus } from 'state/sites/connection/actions';

class QuerySiteConnectionStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSiteConnectionStatus: PropTypes.bool,
		requestConnectionStatus: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingSiteConnectionStatus ) {
			return;
		}

		props.requestConnectionStatus( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteConnectionStatus: isRequestingSiteConnectionStatus( state, ownProps.siteId )
		};
	},
	{ requestConnectionStatus }
)( QuerySiteConnectionStatus );
