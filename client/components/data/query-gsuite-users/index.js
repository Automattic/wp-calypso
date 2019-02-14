/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isLoaded } from 'state/google-apps-users/selectors';
import { fetchBySiteId as fetchGSuiteUsers } from 'state/google-apps-users/actions';

class QueryGSuiteUsers extends Component {
	constructor( props ) {
		super( props );
		this.requestGSuiteUsers = this.requestGSuiteUsers.bind( this );
	}

	componentWillMount() {
		this.requestGSuiteUsers();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.isLoaded || ! nextProps.siteId || this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.requestGSuiteUsers( nextProps );
	}

	requestGSuiteUsers( props = this.props ) {
		if ( ! props.isLoaded && props.siteId ) {
			props.fetchGSuiteUsers( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryGSuiteUsers.propTypes = {
	siteId: PropTypes.number,
	isLoaded: PropTypes.bool,
	fetchBySiteId: PropTypes.func,
};

QueryGSuiteUsers.defaultProps = {
	fetchBySiteId: () => {},
};

export default connect(
	state => {
		return {
			isLoaded: isLoaded( state ),
		};
	},
	dispatch => {
		return bindActionCreators( { fetchGSuiteUsers }, dispatch );
	}
)( QueryGSuiteUsers );
