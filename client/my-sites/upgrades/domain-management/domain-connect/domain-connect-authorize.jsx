/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card/compact';
import Main from 'components/main';
import Notice from 'components/notice';
import upgradesActions from 'lib/upgrades/actions';

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
			notice: null,
			dnsTemplateConflicts: null,
		};
	}

	componentDidMount() {
		const { provider_id, params } = this.props,
			{ domain } = params;

		upgradesActions.getDnsTemplateConflicts( domain, provider_id, params, ( error, data ) => {
			if ( ! error ) {
				this.setState( {
					dnsTemplateConflicts: data.records,
				} );
			}
		} );
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

	renderConflict = () => {
		if ( null !== this.state.dnsTemplateConflicts ) {
			return (
				<div>
					<p>
						{ translate( 'The following DNS records will be replaced when you make this change:' ) }
					</p>
					<div className="domain-connect__dns-list">
						<ul>
							{
								this.state.dnsTemplateConflicts.map( ( record, index ) => {
									return (
										<li key={ index }>
											<div className="domain-connect__dns-list-type">
												<label>{ record.type }</label>
											</div>
											<div className="domain-connect__dns-list-info">
												<strong>{ record.name }</strong>
												<em>{ record.data }</em>
											</div>
										</li>
									);
								} )
							}
						</ul>
					</div>
					<p>
						{
							translate( 'The services that these records were used for may no longer work if they ' +
								'are removed. If you are trying to switch from one service provider to another ' +
								'this is probably what you want to do.' )
						}
					</p>
				</div>
			);
		}
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
						translate( 'We weren\'t able to add the DNS records needed for this service. Please try again.' ) }>
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
					<Gridicon icon="checkmark" /> { translate( 'Confirm' ) }
				</Button>
				<Button
					icon
					className="domain-connect__button"
					onClick={ this.handleClickCancel }
					busy={ actionType.READY_TO_SUBMIT !== this.state.action }
					disabled={ actionType.READY_TO_SUBMIT !== this.state.action }>
					<Gridicon icon="cross" /> { translate( 'Cancel' ) }
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
					{ translate( 'Close' ) }
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

		// TODO: Get this string from somewhere...based on the template that is being used.
		// This is just an example of what the description may look like. I don't like that
		const description = 'make your domain work with the Google G Suite email service.';

		return (
			<Main className="domain-connect__main">
				<Card>
					<h2>
						{
							translate( 'Authorize DNS Changes for %(domain)s',
								{
									args: { domain: domain },
									comment: '%(domain)s is the domain name that we are requesting the user to authorize changes to.'
								}
							)
						}
					</h2>
					<p>
						{
							translate( 'Howdy! It looks like you want to %(description)s ' +
								'This means that we\'ll be adding some new DNS records for you.',
								{
									args: { description: description },
									comment: '%(description)s is a brief phrase that summarizes the changes that will be made.'
								}
							)
						}
					</p>
					{ this.renderConflict() }
					<p>
						{
							translate( 'When you\'re ready to proceed, click Confirm. If this isn\'t what you meant to do,' +
								'click Cancel and we won\'t make any changes.' )
						}
					</p>
					{ this.renderNotice() }
					{ this.renderAction() }
				</Card>
			</Main>
		);
	}
}

export default DomainConnectAuthorize;
