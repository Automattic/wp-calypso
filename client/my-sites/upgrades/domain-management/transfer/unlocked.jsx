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
import { requestTransferCode, enableDomainLocking } from 'lib/upgrades/actions';
import notices from 'notices';
import { displayRequestTransferCodeResponseNotice } from 'my-sites/upgrades/domain-management/transfer/shared';
import support from 'lib/url/support';

const Unlocked = React.createClass( {
	getInitialState() {
		return {
			submitting: false
		}
	},

	handleCancelTransferClick() {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		this.setState( { submitting: true } );

		enableDomainLocking( {
			domainName: this.props.selectedDomainName,
			declineTransfer: true,
			enablePrivacy: hasPrivacyProtection && ! privateDomain,
			siteId: this.props.selectedSite.ID
		}, ( error ) => {
			if ( error ) {
				const contactLink = <a href={ support.CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer"/>;
				let errorMessage;

				switch ( error.error ) {
					case 'enable_private_reg_failed':
						errorMessage = this.translate( 'We were unable to enable Privacy Protection for your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					case 'decline_transfer_failed':
						errorMessage = this.translate( 'We were unable to stop the transfer for your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					case 'lock_domain_failed':
						errorMessage = this.translate( 'We were unable to lock your domain. ' +
							'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
							{ components: { contactLink } } );
						break;
					default:
						errorMessage = this.translate(
							'Oops! Something went wrong and your request could not be ' +
							'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
							'you continue to have trouble.', { components: { contactLink } }
						);
						break;
				}
				notices.error( errorMessage );
			} else {
				if ( hasPrivacyProtection ) {
					notices.success( this.translate( 'We\'ve canceled your domain transfer. Your domain is now locked and ' +
						'Privacy Protection has been enabled.' ) );
				} else {
					notices.success( this.translate( 'We\'ve canceled your domain transfer. Your domain is now locked back.' ) );
				}
			}
			if ( this.isMounted() ) {
				// component might be unmounted since it's state changed to locked
				this.setState( { submitting: false } );
			}
		} );
	},

	handleResendConfirmationCodeClick() {
		this.setState( { submitting: true } );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: false,
			disablePrivacy: false
		};

		requestTransferCode( options, ( error ) => {
			this.setState( { submitting: false } );
			displayRequestTransferCodeResponseNotice( error, getSelectedDomain( this.props ) );
		} );
	},

	render() {
		const { privateDomain, hasPrivacyProtection, manualTransferRequired } = getSelectedDomain( this.props );
		return (
			<div>
				<SectionHeader label={ this.translate( 'Transfer Domain' ) } className="transfer__section-header">
						<Button
							onClick={ this.handleCancelTransferClick }
							disabled={ this.state.submitting }
							compact>{ this.translate( 'Cancel Transfer' ) }</Button>
					{ ! manualTransferRequired && <Button
							onClick={ this.handleResendConfirmationCodeClick }
							disabled={ this.state.submitting }
							compact
							primary>{ this.translate( 'Resend Transfer Code' ) }</Button> }
				</SectionHeader>

				<Card className="transfer-card">
					<div>
						<p>{ hasPrivacyProtection && ! privateDomain
								? this.translate( 'Your domain is unlocked and Privacy Protection has been disabled to prepare for transfer.' )
								: this.translate( 'Your domain is unlocked to prepare for transfer.' ) }
						</p>

						<p>
							{
								! manualTransferRequired
								? this.translate( 'We have sent the transfer authorization code to the domain registrant\'s' +
									' email address. You must provide your registrar with your domain name and transfer code to complete' +
									' the transfer process.' )
								: this.translate( 'The registry for your domain requires a special process for transfers. ' +
									'Our Happiness Engineers have been notified about your transfer request and will be in touch ' +
									'shortly to help you complete the process.' )
							} <a
							href={ support.TRANSFER_DOMAIN_REGISTRATION }
							target="_blank"
							rel="noopener noreferrer">{ this.translate( 'Learn More.' ) }</a>
						</p>
					</div>
				</Card>
			</div>
		);
	}
} );
export default Unlocked;
