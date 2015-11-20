/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import notices from 'notices';
import { getSelectedDomain } from 'lib/domains';
import { requestTransferCode } from 'lib/upgrades/actions';

const RequestTransferCode = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.object.isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			disableDomainLock: false,
			disablePrivacy: false,
			submitting: false
		};
	},

	render() {
		return (
			<div className="transfer__request_transfer-code">
				{ this.renderDomainLockedInfo() }
				{ this.renderGeneralTransferInfo() }
				{ this.renderTransferRequirements() }
				{ this.renderDisableDomainLockOption() }
				{ this.renderDisablePrivacyOption() }
				{ this.renderManualTransferInfo() }
				{ this.renderRequestTransferCodeButton() }
			</div>
		);
	},

	renderDomainLockedInfo() {
		if ( ! this.props.wapiDomainInfo.data.locked ) {
			return null;
		}

		return (
			<p>
				{ this.translate(
					'Your domain is currently {{strong}}locked{{/strong}}. This ' +
					'protects your domain from being transferred to another registrar ' +
					'without your permission.',
					{ components: { strong: <strong /> } }
				) }
			</p>
		);
	},

	renderGeneralTransferInfo() {
		return (
			<p>
				{ this.translate(
					'You can transfer your domain to another domain ' +
					'registrar at any time by providing them with your domain name ' +
					'and transfer code.'
				) }
			</p>
		);
	},

	renderTransferRequirements() {
		const { locked } = this.props.wapiDomainInfo.data,
			{ privateDomain } = getSelectedDomain( this.props );

		let message;

		if ( ! locked && ! privateDomain ) {
			return null;
		} else if ( locked && privateDomain ) {
			message = this.translate(
				'In order to transfer your domain to another registrar, it ' +
				'must both be unlocked and have Private Registration disabled.'
			);
		} else if ( locked ) {
			message = this.translate(
				'In order to transfer your domain to another registrar, it ' +
				'must be unlocked.'
			);
		} else if ( privateDomain ) {
			message = this.translate(
				'In order to transfer your domain to another registrar, it ' +
				'must have Private Registration disabled.'
			);
		}

		return <p>{ message }</p>;
	},

	renderDisableDomainLockOption() {
		if ( ! this.props.wapiDomainInfo.data.locked ) {
			return null;
		}

		return (
			<FormLabel>
				<FormInputCheckbox onChange={ this.handleDisableDomainLockChange }
					disabled={ this.isDisabled() }
					value={ this.state.disableDomainLock } />

				{ this.translate(
					'Disable the Domain Lock to allow it to be transferred.'
				) }
			</FormLabel>
		);
	},

	handleDisableDomainLockChange() {
		this.setState( { disableDomainLock: ! this.state.disableDomainLock } );
	},

	renderDisablePrivacyOption() {
		const { privateDomain } = getSelectedDomain( this.props );

		if ( ! privateDomain ) {
			return null;
		}

		return (
			<div>
				<FormLabel>
					<FormInputCheckbox onChange={ this.handleDisablePrivacyChange }
						disabled={ this.isDisabled() }
						value={ this.state.disablePrivacy } />

					{ this.translate(
						'Disable Private Registration. I understand that my contact ' +
						'details will be publicly available during the transfer period.'
					) }
				</FormLabel>
			</div>
		);
	},

	handleDisablePrivacyChange() {
		this.setState( { disablePrivacy: ! this.state.disablePrivacy } );
	},

	renderRequestTransferCodeButton() {
		return (
			<Button primary={ true }
					onClick={ this.handleRequestTransferCodeClick }
					disabled={ this.isDisabled() }>
				{ this.translate( 'Request Transfer Code' ) }
			</Button>
		);
	},

	isDisabled() {
		const { transferProhibited } = getSelectedDomain( this.props );
		return this.state.submitting || transferProhibited;
	},

	handleRequestTransferCodeClick( event ) {
		event.preventDefault();

		this.setState( { submitting: true } );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: this.state.disableDomainLock,
			disablePrivacy: this.state.disablePrivacy
		};

		requestTransferCode( options, ( error ) => {
			this.setState( { submitting: false } );
			this.displayRequestTransferCodeResponseNotice( error );
		} );
	},

	displayRequestTransferCodeResponseNotice( error ) {
		if ( error ) {
			notices.error(
				this.translate(
					'An error occurred while trying to send the Domain Transfer code. ' +
					'Please try again or {{a}}Contact Support{{/a}} if you continue ' +
					'to have trouble.',
					{
						components: {
							a: (
								<a href="https://support.wordpress.com/contact/"
									target="_blank" />
							)
						}
					}
				)
			);

			return;
		}

		if ( this.isManualTransferRequired() ) {
			notices.success(
				this.translate(
					'Our support team has been notified and will contact you once we ' +
					'receive the transfer code for this domain.'
				)
			);
		} else {
			notices.success(
				this.translate(
					"An email has been sent to the Domain Registrant's contact email " +
					"address containing the Domain Transfer Code. If you don't " +
					'receive the email shortly, please check your spam folder.'
				)
			);
		}
	},

	isManualTransferRequired() {
		return getSelectedDomain( this.props ).manualTransferRequired;
	},

	renderManualTransferInfo() {
		if ( ! this.isManualTransferRequired() ) {
			return null;
		}

		return (
			<p>
				{ this.translate(
					'This Top Level Domain (TLD) requires that we manually request a ' +
					'transfer code on your behalf. After we have received it, we will ' +
					'email it to you.'
				) }
			</p>
		);
	}
} );

export default RequestTransferCode;
