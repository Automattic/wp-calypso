/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';
import { requestSites, requestSite } from 'state/sites/actions';

class QuerySites extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( ! props.siteId && ! props.requestingSites ) {
			props.requestSites();
		}

		if ( props.siteId && ! props.requestingSite ) {
			props.requestSite( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySites.propTypes = {
	siteId: PropTypes.number,
	requestingSites: PropTypes.bool,
	requestingSite: PropTypes.bool,
	requestSites: PropTypes.func,
	requestSite: PropTypes.func
};

QuerySites.defaultProps = {
	requestSites: () => {},
	requestSite: () => {}
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSites: isRequestingSites( state ),
			requestingSite: isRequestingSite( state, siteId )
		};
	},
	{ requestSites, requestSite }
)( QuerySites );
