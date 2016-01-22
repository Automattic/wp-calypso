/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedDomain } from 'lib/domains';
import Button from 'components/button';
import { requestTransferCode } from 'lib/upgrades/actions';
import Dialog from 'components/dialog';
import { displayRequestTransferCodeResponseNotice } from 'my-sites/upgrades/domain-management/transfer/shared';

const Locked = React.createClass( {
	getInitialState() {
		return {
			submitting: false,
			showDialog: false
		}
	},

	unlockAndRequestTransferCode: function() {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: true,
			disablePrivacy: privateDomain && hasPrivacyProtection
		};

		this.setState( { submitting: true } );
		requestTransferCode( options, ( error ) => {
			if ( this.isMounted() ) {
				// Component might be unmounted since it's state has just changed to unlocked.
				this.setState( { submitting: false } );
			}
			displayRequestTransferCodeResponseNotice( error, getSelectedDomain( this.props ) );
		} );
	},
	handleTransferClick() {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		if ( hasPrivacyProtection && privateDomain ) {
			this.setState( { showDialog: true } );
		} else {
			this.unlockAndRequestTransferCode();
		}
	},

	isManualTransferRequired() {
		return getSelectedDomain( this.props ).manualTransferRequired;
	},

	renderManualTransferInfo() {
		return (
			<p>
				{ this.translate(
					'This Top Level Domain (TLD) requires that we manually request a ' +
					'transfer code on your behalf. After we have received it, we will ' +
					'email it to you.'
				) }
			</p>
		);
	},

	handlePrivacyRemovalCancelClick() {
		this.setState( { showDialog: false } );
	},

	handlePrivacyRemovalConfirmClick() {
		this.setState( { showDialog: false } );
		this.unlockAndRequestTransferCode();
	},

	renderPrivacyRemovalDialog() {
		const buttons = [
			<Button onClick={ this.handlePrivacyRemovalCancelClick }>{ this.translate( 'Cancel' ) }</Button>,
			<Button
				onClick={ this.handlePrivacyRemovalConfirmClick }
				primary={ true }>{ this.translate( 'Continue with Transfer' ) }</Button>
		];

		return (
			<Dialog className="transfer__remove-privacy-dialog" isVisible={ this.state.showDialog } buttons={ buttons }>
				<h1>{ this.translate( 'Privacy Protection' ) }</h1>
				<p>{ this.translate( 'To transfer your domain to another registrar, your Privacy Protection will be disabled. ' +
					'Your contact details will be publicly available during the transfer period.' ) }</p>
			</Dialog>
		);
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Transfer Domain' ) }/>
				<Card className="transfer-card">
					<div>
						<p>
							{ this.translate(
								'You can transfer your domain to another domain ' +
								'registrar at any time by providing them with your a transfer code. ' +
								'The transfer code will be sent to the domain\'s registered contact email. ' +
								'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
								{
									components: {
										learnMoreLink: <a
											href="https://support.wordpress.com/transfer-domain-registration/"
											target="_blank"/>

									}
								}
							) }
						</p>
						{ this.isManualTransferRequired() && this.renderManualTransferInfo() }
						<Button
							className="transfer__action-button"
							onClick={ this.handleTransferClick }
							primary
							disabled={ this.state.submitting }>
							{ this.translate( 'Request Transfer Code' ) }
						</Button>
					</div>
				</Card>
				{ this.renderPrivacyRemovalDialog() }
			</div>
		);
	}

} );
export default Locked;
