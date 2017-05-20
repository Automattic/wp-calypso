/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Main from 'components/main';
import Card from 'components/card/compact';
import upgradesActions from 'lib/upgrades/actions';
import Notice from 'components/notice';

const actionType = {
	READY_TO_SUBMIT: 'action-ready-to-submit',
	SUBMITTING: 'action-submitting',
	CLOSE: 'action-close'
};

const noticeType = {
	ERROR: 'notice-error',
	SUCCESS: 'notice-success'
};

class DomainConnectAuthorize extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			action: actionType.READY_TO_SUBMIT,
			notice: null
		};
	}

	handleClickConfirm = () => {
		const { provider_id, params } = this.props,
			{ domain } = params;

		this.setState( {
			action: actionType.SUBMITTING,
			notice: null
		} );

		upgradesActions.applyDnsTemplate( domain, provider_id, params, ( error ) => {
			if ( error ) {
				this.setState( {
					action: actionType.READY_TO_SUBMIT,
					notice: noticeType.ERROR,
					errorMessage: error.message
				} );
			} else {
				this.setState( {
					action: actionType.CLOSE,
					notice: noticeType.SUCCESS
				} );
			}
		} );
	}

	handleClickCancel = () => {
		window.close();
	}

	renderNoticeSuccess = () => {
		return (
			<div>
				<Notice
					status="is-success"
					showDismiss={ false }
					text={ translate( 'Horray! Your service is now all set up.' ) }>
				</Notice>
			</div>
		);
	}

	renderNoticeError = () => {
		return (
			<div>
				<Notice
					status="is-error"
					showDismiss={ false }
					text={
						this.state.errorMessage ||
						translate( 'We weren\'t able to add DNS records for this service. Please try again.' ) }>
				</Notice>
			</div>
		);
	}

	renderNotice = () => {
		switch ( this.state.notice ) {
			case noticeType.SUCCESS:
				return this.renderNoticeSuccess();
			case noticeType.ERROR:
				return this.renderNoticeError();
		}
	}

	renderActionConfirmCancel = () => {
		return (
			<div>
				<Button
					icon
					className="domain-connect__button"
					primary
					onClick={ this.handleClickConfirm }
					busy={ actionType.READY_TO_SUBMIT !== this.state.action }
					disabled={ actionType.READY_TO_SUBMIT !== this.state.action }>
					<Gridicon icon="checkmark" /> Confirm
				</Button>
				<Button
					icon
					className="domain-connect__button"
					onClick={ this.handleClickCancel }
					busy={ actionType.READY_TO_SUBMIT !== this.state.action }
					disabled={ actionType.READY_TO_SUBMIT !== this.state.action }>
					<Gridicon icon="cross" /> Cancel
				</Button>
			</div>
		);
	}

	renderActionClose = () => {
		return (
			<div>
				<Button
					className="domain-connect__button"
					onClick={ this.handleClickCancel }>
					Close
				</Button>
			</div>
		);
	}

	renderAction = () => {
		switch ( this.state.action ) {
			case actionType.READY_TO_SUBMIT:
			case actionType.SUBMITTING:
				return this.renderActionConfirmCancel();
			case actionType.CLOSE:
				return this.renderActionClose();
		}
	}

	render() {
		const { domain } = this.props.params;

		return (
			<Main className="domain-connect__main">
				<Card>
					<h2>Authorize DNS Changes for { domain }</h2>
					<p>
						Howdy! It looks like you want to make your domain work with the Google G Suite email service.
						This means that we'll be adding some new DNS records for you.
					</p>
					<p>
						When you're ready to proceed, click Confirm. If this isn't what you meant to do,
						click Cancel and we won't add the records.
					</p>
					{ this.renderNotice() }
					{ this.renderAction() }
				</Card>
			</Main>
		);
	}
}

export default DomainConnectAuthorize;
