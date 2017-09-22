/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isUserConnected } from 'state/jetpack-connect/actions';
import { isRequestingSite } from 'state/sites/selectors';

class QueryUserConnection extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.siteId && ! props.requestingSite ) {
			props.isUserConnected( props.siteId, props.siteIsOnSitesList );
		}
	}

	render() {
		return null;
	}
}

QueryUserConnection.propTypes = {
	siteId: PropTypes.number,
	siteIsOnSitesList: PropTypes.bool,
	requestingSite: PropTypes.bool,
	isUserConnected: PropTypes.func
};

QueryUserConnection.defaultProps = {
	isUserConnected: () => {},
	siteIsOnSitesList: false
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSite: isRequestingSite( state, siteId )
		};
	},
	{ isUserConnected }
)( QueryUserConnection );
