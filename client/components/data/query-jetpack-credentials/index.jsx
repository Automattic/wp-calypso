/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingCredentials } from 'state/jetpack/credentials/selectors';
import { requestCredentials } from 'state/jetpack/credentials/actions';

class QueryJetpackCredentials extends Component {
	componentWillMount() {
		if ( ! this.props.requestingCredentials ) {
			this.props.requestCredentials( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryJetpackCredentials.propTypes = {
	requestingCredentials: PropTypes.bool,
	requestCredentials: PropTypes.func,
	siteId: PropTypes.number.isRequired
};

QueryJetpackCredentials.defaultProps = {
	requestCredentials: () => {},
};

export default connect(
	state => {
		return {
			requestingCredentials: isRequestingCredentials( state ),
		};
	},
	{ requestCredentials }
)( QueryJetpackCredentials );
