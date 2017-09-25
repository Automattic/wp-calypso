/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSites, requestSite } from 'state/sites/actions';
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';

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
		if ( props.allSites && ! props.requestingSites ) {
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
	allSites: PropTypes.bool,
	siteId: PropTypes.number,
	requestingSites: PropTypes.bool,
	requestingSite: PropTypes.bool,
	requestSites: PropTypes.func,
	requestSite: PropTypes.func
};

QuerySites.defaultProps = {
	allSites: false,
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
