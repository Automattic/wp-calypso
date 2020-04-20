/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * Internal dependencies
 */
import { startPollAppPushAuth, stopPollAppPushAuth } from 'state/login/actions';
import { getTwoFactorPushPollSuccess } from 'state/login/selectors';

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

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.pushSuccess && this.props.pushSuccess ) {
			this.props.onSuccess();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		pushSuccess: getTwoFactorPushPollSuccess( state ),
	} ),
	{
		startPollAppPushAuth,
		stopPollAppPushAuth,
	}
)( PushNotificationApprovalPoller );
