/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	cancelDomainTransferRequest,
	fetchWapiDomainInfo,
	requestDomainTransferCode,
} from 'calypso/state/domains/transfer/actions';
import { TRANSFER_DOMAIN_REGISTRATION_WITH_NEW_REGISTRAR } from 'calypso/lib/url/support';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';

class Unlocked extends React.Component {
	state = {
		sent: ! this.isDomainAlwaysTransferrable(),
	};

	componentWillUnmount() {
		this.setStateIfMounted = noop;
	}

	setStateIfMounted( ...args ) {
		/**
		 * Wrap setState calls that might occur after unmounting.
		 *
		 * When we cancel a transfer, that might update locking or privacy,
		 * but errors mean we can't know in time - the store gets the information
		 * before we do.
		 *
		 * The recommended solution is cancellable promises, but we don't want to
		 * cancel these requests if we navigate away, so that won't work for us here.
		 */
		this.setState( ...args );
	}

	handleCancelTransferClick = () => {
		const { privateDomain, pendingTransfer, domainLockingAvailable } = getSelectedDomain(
			this.props
		);

		const enablePrivacy = ! privateDomain;
		const lockDomain = domainLockingAvailable;

		this.props.cancelDomainTransferRequest( this.props.selectedDomainName, {
			declineTransfer: pendingTransfer,
			siteId: this.props.selectedSite.ID,
			enablePrivacy,
			lockDomain,
		} );
		// TODO: Fix this
		const error = {};

		if ( error ) {
			// TODO: Remove his
		} else {
			// Success.
			this.setStateIfMounted( { sent: false } );
		}
		// END TODO: Fix this
	};

	isDomainAlwaysTransferrable() {
		const { domainLockingAvailable, privateDomain } = getSelectedDomain( this.props );
		return ! domainLockingAvailable && ! privateDomain;
	}

	renderCancelButton( domain ) {
		const { pendingTransfer } = domain;

		const showCancelButton = pendingTransfer || ! this.isDomainAlwaysTransferrable();
		if ( ! showCancelButton ) {
			return null;
		}

		return (
			<Button
				className="transfer-out__action-button"
				onClick={ this.handleCancelTransferClick }
				disabled={ this.props.isSubmitting || ! this.state.sent }
			>
				{ this.props.translate( 'Cancel Transfer' ) }
			</Button>
		);
	}

	renderSendButton( domain ) {
		const { translate } = this.props;
		const { manualTransferRequired } = domain;

		if ( manualTransferRequired && this.state.sent ) {
			return null;
		}

		return (
			<Button
				className="transfer-out__action-button"
				onClick={ this.handleSendConfirmationCodeClick }
				disabled={ this.props.isSubmitting }
				primary
			>
				{ this.state.sent
					? translate( 'Resend Transfer Code' )
					: translate( 'Send Transfer Code' ) }
			</Button>
		);
	}

	handleSendConfirmationCodeClick = () => {
		const options = {
			siteId: this.props.selectedSite.ID,
			unlock: false,
			disablePrivacy: false,
		};

		this.props.requestDomainTransferCode( this.props.selectedDomainName, options );
	};

	renderPendingTransferBody() {
		const { translate } = this.props;
		return (
			<div>
				<p>{ translate( 'Your domain is pending transfer.' ) }</p>
			</div>
		);
	}

	renderManualTransferBody() {
		const { translate } = this.props;
		const { sent } = this.state;

		return (
			<p>
				{ translate( 'The registry for your domain requires a special process for transfers. ' ) }{ ' ' }
				{ sent
					? translate(
							'Our Happiness Engineers have been notified about ' +
								'your transfer request and will be in touch shortly to help ' +
								'you complete the process.'
					  )
					: translate(
							'Please request an authorization code to notify our ' +
								'Happiness Engineers of your intention.'
					  ) }
			</p>
		);
	}

	renderAuthorizationCodeBody() {
		const { isSubmitting, translate } = this.props;
		const { sent } = this.state;

		const sentStatement =
			sent &&
			translate(
				'We have sent the transfer authorization code to the ' +
					"domain registrant's email address."
			) + ' ';
		return (
			<div>
				{ ! ( isSubmitting || sent ) && (
					<p>
						{ translate( 'Please press the button to request a transfer authorization code.' ) }
					</p>
				) }
				<p>
					{ sentStatement }
					{ translate(
						'You must provide your new registrar with your ' +
							'domain name and transfer code to complete the transfer process.'
					) }
				</p>
			</div>
		);
	}

	render() {
		const { isSubmitting, translate } = this.props;
		const domain = getSelectedDomain( this.props );
		const { privateDomain, domainLockingAvailable } = domain;
		const privacyDisabled = ! privateDomain;

		let domainStateMessage;
		if ( domainLockingAvailable && privacyDisabled ) {
			domainStateMessage = translate(
				'Your domain is unlocked and ' +
					'Privacy Protection has been disabled to prepare for transfer.'
			);
		} else if ( privacyDisabled ) {
			domainStateMessage = translate(
				'Privacy Protection for your ' + 'domain has been disabled to prepare for transfer.'
			);
		} else if ( domainLockingAvailable ) {
			domainStateMessage = translate( 'Your domain is unlocked to prepare for transfer.' );
		}

		return (
			<div>
				<Card className="transfer-out__card">
					<div className="transfer-out__content">
						{ isSubmitting && <p>{ translate( 'Sending request…' ) }</p> }
						{ domainStateMessage && <p>{ domainStateMessage }</p> }
						{ this.renderBody( domain ) }
						<a
							href={ TRANSFER_DOMAIN_REGISTRATION_WITH_NEW_REGISTRAR }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ translate( 'Learn More.' ) }
						</a>
					</div>
					{ this.renderSendButton( domain ) }
					{ this.renderCancelButton( domain ) }
				</Card>
			</div>
		);
	}

	renderBody( domain ) {
		const { manualTransferRequired, pendingTransfer } = domain;

		if ( pendingTransfer ) {
			return this.renderPendingTransferBody();
		}

		if ( manualTransferRequired ) {
			return this.renderManualTransferBody();
		}

		return this.renderAuthorizationCodeBody();
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const domainInfo = getDomainWapiInfoByDomainName( state, selectedDomainName );
		const isRequestingTransferCode = !! domainInfo.isRequestingTransferCode;
		const isCancelingTransfer = !! domainInfo.isCancelingTransfer;

		return {
			isSubmitting: isRequestingTransferCode || isCancelingTransfer,
		};
	},
	{
		cancelDomainTransferRequest,
		fetchWapiDomainInfo,
		requestDomainTransferCode,
	}
)( localize( Unlocked ) );
