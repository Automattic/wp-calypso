/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';

const initialState = { status: 'ready', errorLevel: false, errorMessage: false };

const SMS_URL = '/sms';

export class AuthCodeButton extends React.Component {
	static defaultProps = {
		translate: identity,
	};

	state = initialState;

	componentWillUnmount() {
		if ( this.request ) {
			this.request.abort();
		}
		clearTimeout( this.timeout );
	}

	// Reset the notice (which might be in 'error' or 'completed' state) back to 'ready' state.
	// Happens either when error notice is dismissed, or when 30s timeout elapses.
	resetSMSCode = () => {
		clearTimeout( this.timeout );
		this.timeout = null;
		this.setState( initialState );
	};

	requestSMSCode = async () => {
		this.setState( { status: 'requesting' } );

		this.request = fetch( SMS_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { username: this.props.username, password: this.props.password } ),
		} ).then( ( response ) => response.json() );

		try {
			this.handleSMSResponse( null, await this.request );
		} catch ( error ) {
			this.handleSMSResponse( error, error.response );
		} finally {
			this.request = null;
		}
	};

	handleSMSResponse( error, json ) {
		this.timeout = setTimeout( this.resetSMSCode, 1000 * 30 );

		// if it's 2fa error then we actually successfully requested an sms code
		if ( json && json.error === 'needs_2fa' ) {
			this.setState( { status: 'complete' } );
			return;
		}

		let errorMessage = null;

		// assign the error message from the response json, otherwise take it from the error object
		if ( json && json.error_description ) {
			errorMessage = json.error_description;
		} else if ( error ) {
			errorMessage = error.message;
		}

		this.setState( { status: 'complete', errorLevel: 'is-error', errorMessage } );
	}

	render() {
		const { translate } = this.props;
		const { status, errorLevel, errorMessage } = this.state;

		let noticeStatus = 'is-info';
		let showDismiss = false;
		let message;

		if ( errorLevel ) {
			noticeStatus = errorLevel;
			message = errorMessage;
			showDismiss = true;
		} else if ( status === 'requesting' ) {
			message = translate( 'Requesting code.' );
		} else if ( status === 'complete' ) {
			noticeStatus = 'is-success';
			message = translate( 'Code sent.' );
		} else {
			/* eslint-disable jsx-a11y/anchor-is-valid */
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			/* eslint-disable jsx-a11y/no-static-element-interactions */
			message = (
				<a href="#" onClick={ this.requestSMSCode }>
					{ translate( 'Send code via text message.' ) }
				</a>
			);
			/* eslint-enable jsx-a11y/anchor-is-valid */
			/* eslint-enable jsx-a11y/click-events-have-key-events */
			/* eslint-enable jsx-a11y/no-static-element-interactions */
		}

		return (
			<Notice
				showDismiss={ showDismiss }
				status={ noticeStatus }
				onDismissClick={ this.resetSMSCode }
			>
				{ message }
			</Notice>
		);
	}
}

export default localize( AuthCodeButton );
