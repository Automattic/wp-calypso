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
		this.props.requestCredentials( this.props.siteId );
	}

	render() {
		return null;
	}
}

QueryJetpackCredentials.propTypes = {
	requestCredentials: PropTypes.func,
	siteId: PropTypes.number.isRequired
};

QueryJetpackCredentials.defaultProps = {
	requestCredentials: () => {},
};

export default connect( null, { requestCredentials } )( QueryJetpackCredentials );
