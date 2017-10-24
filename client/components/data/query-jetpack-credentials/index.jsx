/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingJetpackCredentials } from 'state/selectors';
import { fetchCredentials } from 'state/jetpack/credentials/actions';

class QueryJetpackCredentials extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingCredentials ) {
			return;
		}

		props.fetchCredentials( props.siteId );
	}

	render() {
		return null;
	}
}

QueryJetpackCredentials.propTypes = {
	siteId: PropTypes.number.isRequired,
	requestingCredentials: PropTypes.bool,
	fetchCredentials: PropTypes.func
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingCredentials: isRequestingJetpackCredentials( state, ownProps.siteId )
		};
	},
	{ fetchCredentials }
)( QueryJetpackCredentials );
