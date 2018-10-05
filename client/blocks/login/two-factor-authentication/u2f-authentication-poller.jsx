/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * Internal dependencies
 */
import { getU2fChallenge, startPollAppU2fAuth, stopPollAppU2fAuth } from 'state/login/actions';
// import { getTwoFactorU2fPollSuccess } from 'state/login/selectors';

class U2fAuthenticationPoller extends Component {
	static propTypes = {
		// onSuccess: PropTypes.func.isRequired,
		// challengeSuccess: PropTypes.bool.isRequired,
		startPollAppU2fAuth: PropTypes.func.isRequired,
		stopPollAppU2fAuth: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.startPollAppU2fAuth();
	}

	componentWillUnmount() {
		this.props.stopPollAppU2fAuth();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.pushSuccess && nextProps.pushSuccess ) {
			this.props.onSuccess();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		pushSuccess: getTwoFactorPushPollSuccess( state ),
	} ),
	{
		startPollAppU2fAuth,
		stopPollAppU2fAuth,
		getU2fChallenge,
	}
)( U2fAuthenticationPoller );
