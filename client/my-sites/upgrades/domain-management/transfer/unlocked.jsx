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
import { requestTransferCode, enableDomainLocking, enablePrivacyProtection, declineTransfer } from 'lib/upgrades/actions';
import notices from 'notices';
import { promisy, displayRequestTransferCodeResponseNotice } from 'my-sites/upgrades/domain-management/transfer/shared';

const Unlocked = React.createClass( {
	getInitialState() {
		return {
			submitting: false
		}
	},

	handleCancelTransferClick() {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		this.setState( { submitting: true } );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName
		};

		const actions = [
			promisy( declineTransfer )( this.props.selectedDomainName ),
			promisy( enableDomainLocking )( this.props.selectedDomainName )
		];

		if ( hasPrivacyProtection && ! privateDomain ) {
			actions.push( promisy( enablePrivacyProtection )( options ) );
		}

		Promise.all( actions ).then( () => {
			notices.success( this.translate( 'We\'ve canceled your domain transfer. Your domain is now locked and ' +
				'Privacy Protection has been enabled.' ) );
			if ( this.isMounted() ) {
				// component might be unmounted since it's state changed to locked
				this.setState( { submitting: false } );
			}
		}, ( error ) => {
			if ( this.isMounted() ) {
				// component might be unmounted since the request
				this.setState( { submitting: false } );
			}
			if ( error ) {
				notices.error(
					this.translate(
						'Oops! Something went wrong and your request could not be ' +
						'processed. Please try again or {{a}}Contact Support{{/a}} if ' +
						'you continue to have trouble.',
						{
							components: {
								a: (
									<a
										href="https://support.wordpress.com/contact/"
										target="_blank" />
								)
							}
						}
					)
				);
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
							href="https://support.wordpress.com/transfer-domain-registration/"
							target="_blank">{ this.translate( 'Learn More.' ) }</a>
						</p>
					</div>
				</Card>
			</div>
		);
	}
} );
export default Unlocked;
