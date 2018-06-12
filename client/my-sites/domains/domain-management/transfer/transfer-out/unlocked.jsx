/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedDomain } from 'lib/domains';
import Button from 'components/button';
import { requestTransferCode, cancelTransferRequest } from 'lib/upgrades/actions';
import notices from 'notices';
import {
	displayRequestTransferCodeResponseNotice,
	renderGdprTransferWarningNotice,
} from './shared';
import { CALYPSO_CONTACT, TRANSFER_DOMAIN_REGISTRATION } from 'lib/url/support';

class Unlocked extends React.Component {
	state = {
		submitting: false,
		sent: ! this.isDomainAlwaysTransferrable(),
	};

	componentWillUnmount() {
		this.setStateIfMounted = noop;
	}

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
	setStateIfMounted( ...args ) {
		this.setState( ...args );
	}

	handleCancelTransferClick = () => {
		const { translate } = this.props;
		const {
			privateDomain,
			hasPrivacyProtection,
			pendingTransfer,
			domainLockingAvailable,
		} = getSelectedDomain( this.props );

		this.setState( { submitting: true } );

		const enablePrivacy = hasPrivacyProtection && ! privateDomain;
		const lockDomain = domainLockingAvailable;

		cancelTransferRequest(
			{
				domainName: this.props.selectedDomainName,
				declineTransfer: pendingTransfer,
				siteId: this.props.selectedSite.ID,
				enablePrivacy,
				lockDomain,
			},
			error => {
				this.setStateIfMounted( { submitting: false } );

				if ( error ) {
					const contactLink = (
						<a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />
					);
					let errorMessage;

					switch ( error.error ) {
						case 'enable_private_reg_failed':
							errorMessage = translate(
								'We were unable to enable Privacy Protection for your domain. ' +
									'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
								{ components: { contactLink } }
							);
							break;
						case 'decline_transfer_failed':
							errorMessage = translate(
								'We were unable to stop the transfer for your domain. ' +
									'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
								{ components: { contactLink } }
							);
							break;
						case 'lock_domain_failed':
							errorMessage = translate(
								'We were unable to lock your domain. ' +
									'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
								{ components: { contactLink } }
							);
							break;
						default:
							errorMessage = translate(
								'Oops! Something went wrong and your request could not be ' +
									'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
									'you continue to have trouble.',
								{ components: { contactLink } }
							);
							break;
					}
					notices.error( errorMessage );
				} else {
					// Success.
					this.setStateIfMounted( { sent: false } );

					let successMessage;
					if ( enablePrivacy && lockDomain ) {
						successMessage = translate(
							"We've canceled your domain transfer. Your domain is now re-locked and " +
								'Privacy Protection has been enabled.'
						);
					} else if ( enablePrivacy ) {
						successMessage = translate(
							"We've canceled your domain transfer and " + 'Privacy Protection has been re-enabled.'
						);
					} else if ( lockDomain ) {
						successMessage = translate(
							"We've canceled your domain transfer and " + 're-locked your domain.'
						);
					} else {
						successMessage = translate( "We've canceled your domain transfer. " );
					}

					notices.success( successMessage );
				}
			}
		);
	};

	isDomainAlwaysTransferrable() {
		const { domainLockingAvailable, hasPrivacyProtection } = getSelectedDomain( this.props );
		return ! domainLockingAvailable && ! hasPrivacyProtection;
	}

	renderCancelButton( domain ) {
		const { pendingTransfer } = domain;

		const showCancelButton = pendingTransfer || ! this.isDomainAlwaysTransferrable();
		if ( ! showCancelButton ) {
			return null;
		}

		return (
			<Button
				onClick={ this.handleCancelTransferClick }
				disabled={ this.state.submitting || ! this.state.sent }
				compact
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
				onClick={ this.handleSendConfirmationCodeClick }
				disabled={ this.state.submitting }
				compact
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
			domainName: this.props.selectedDomainName,
			unlock: false,
			disablePrivacy: false,
		};

		this.setState( { submitting: true } );

		requestTransferCode( options, error => {
			this.setState( { submitting: false } );
			if ( ! error ) {
				this.setState( { sent: true } );
			}
			displayRequestTransferCodeResponseNotice( error, getSelectedDomain( this.props ) );
		} );
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
				{ translate( 'The registry for your domain requires a special process for transfers. ' ) }{' '}
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
		const { translate } = this.props;
		const { submitting, sent } = this.state;

		const sentStatement =
			sent &&
			translate(
				'We have sent the transfer authorization code to the ' +
					"domain registrant's email address."
			) + ' ';
		return (
			<div>
				{ ! ( submitting || sent ) && (
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
		const { translate } = this.props;
		const { submitting } = this.state;
		const domain = getSelectedDomain( this.props );
		const { privateDomain, hasPrivacyProtection, domainLockingAvailable } = domain;
		const privacyDisabled = hasPrivacyProtection && ! privateDomain;

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
				{ renderGdprTransferWarningNotice() }

				<SectionHeader
					label={ translate( 'Transfer Domain' ) }
					className="transfer-out__section-header"
				>
					{ this.renderCancelButton( domain ) }
					{ this.renderSendButton( domain ) }
				</SectionHeader>

				<Card className="transfer-card">
					<div>
						{ submitting && <p>{ translate( 'Sending request…' ) }</p> }
						{ domainStateMessage && <p>{ domainStateMessage }</p> }
						{ this.renderBody( domain ) }
						<a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer">
							{ translate( 'Learn More.' ) }
						</a>
					</div>
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

export default localize( Unlocked );
