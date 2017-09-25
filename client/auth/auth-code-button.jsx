/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { default as Store, requestState } from 'lib/auth-code-request-store';
import { requestCode, resetCode } from 'lib/auth-code-request-store/actions';

class AuthCodeButton extends React.Component {
	state = Store.get();

	componentDidMount() {
		Store.on( 'change', this.refreshData );
	}

	componentWillUnmount() {
		Store.off( 'change', this.refreshData );
	}

	refreshData = () => {
		this.setState( Store.get() );
	};

	requestSMSCode = e => {
		e.preventDefault();
		requestCode( this.props.username, this.props.password );
	};

	render() {
		const { status, errorLevel, errorMessage } = this.state;

		let noticeStatus = 'is-info';
		let showDismiss = false;
		let message = (
			<a href="#" onClick={ this.requestSMSCode }>{ this.props.translate( 'Send code via text message.' ) }</a>
		);

		if ( status === requestState.REQUESTING ) {
			message = this.props.translate( 'Requesting code.' );
		}

		if ( status === requestState.COMPLETE ) {
			noticeStatus = 'is-success';
			message = this.props.translate( 'Code sent.' );
		}

		if ( errorLevel !== false ) {
			noticeStatus = errorLevel;
			message = errorMessage;
			showDismiss = true;
		}

		return (
			<Notice showDismiss={ showDismiss } status={ noticeStatus } onDismissClick={ resetCode } >
				{ message }
			</Notice>
		);
	}
}

export default localize( AuthCodeButton );
