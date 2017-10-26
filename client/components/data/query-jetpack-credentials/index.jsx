/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCredentials } from 'state/jetpack/credentials/actions';

class QueryJetpackCredentials extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		this.props.requestCredentials( props.siteId );
	}

	render() {
		return null;
	}
}

QueryJetpackCredentials.propTypes = {
	requestCredentials: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired
};

export default connect( null, { requestCredentials } )( QueryJetpackCredentials );
