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
import { startPollAppPushAuth, stopPollAppPushAuth } from 'client/state/login/actions';
import { getTwoFactorPushPollSuccess } from 'client/state/login/selectors';

class PushNotificationApprovalPoller extends Component {
	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
		pushSuccess: PropTypes.bool.isRequired,
		startPollAppPushAuth: PropTypes.func.isRequired,
		stopPollAppPushAuth: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.startPollAppPushAuth();
	}

	componentWillUnmount() {
		this.props.stopPollAppPushAuth();
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
		startPollAppPushAuth,
		stopPollAppPushAuth,
	}
)( PushNotificationApprovalPoller );
