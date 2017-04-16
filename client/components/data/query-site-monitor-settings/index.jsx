/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteMonitorSettings } from 'state/selectors';
import { requestSiteMonitorSettings } from 'state/sites/monitor/actions';

class QuerySiteMonitorSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingSiteMonitorSettings: PropTypes.bool,
		requestSiteMonitorSettings: PropTypes.func
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
		if ( props.requestingSiteMonitorSettings ) {
			return;
		}

		props.requestSiteMonitorSettings( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteMonitorSettings: isRequestingSiteMonitorSettings( state, ownProps.siteId )
		};
	},
	{ requestSiteMonitorSettings }
)( QuerySiteMonitorSettings );
