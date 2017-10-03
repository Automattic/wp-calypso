/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteMonitorSettings } from 'state/selectors';
import { requestSiteMonitorSettings } from 'state/sites/monitor/actions';

class QuerySiteMonitorSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		// Connected props
		requestingSiteMonitorSettings: PropTypes.bool,
		requestSiteMonitorSettings: PropTypes.func
	};

	componentDidMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.siteId && ! props.requestingSiteMonitorSettings ) {
			props.requestSiteMonitorSettings( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		requestingSiteMonitorSettings: isRequestingSiteMonitorSettings( state, siteId ),
	} ),
	{ requestSiteMonitorSettings }
)( QuerySiteMonitorSettings );
