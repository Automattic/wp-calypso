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
import { displayRequestTransferCodeResponseNotice } from 'my-sites/upgrades/domain-management/transfer/shared';
import support from 'lib/url/support';

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

	requestTransferCode() {
		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: false,
			disablePrivacy: false
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
		this.unlockAndRequestTransferCode();
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

	handleGiveMeTheCodeClick( event ) {
		event.preventDefault();
		this.requestTransferCode();
	},

	render() {
		const { privateDomain } = getSelectedDomain( this.props );
		return (
			<div>
				<SectionHeader label={ this.translate( 'Transfer Domain' ) }/>
				<Card className="transfer-card">
					<div>
						<p>
							{ privateDomain
								? this.translate( 'To transfer your domain, we must unlock it and remove Privacy Protection. ' +
									'Your contact information will be publicly available during the transfer period.' )
								: this.translate( 'To transfer your domain, we must unlock it.' )
							} <a
									href={ support.TRANSFER_DOMAIN_REGISTRATION }
									target="_blank" rel="noopener noreferrer">{ this.translate( 'Learn More.' ) }</a>
						</p>
						<p className="transfer__small-text">
							<a href="" onClick={ this.handleGiveMeTheCodeClick }>{ this.translate( 'I just want the transfer code for now.' ) }</a>
						</p>
						{ this.isManualTransferRequired() && this.renderManualTransferInfo() }
						<Button
							className="transfer__action-button"
							onClick={ this.handleTransferClick }
							primary
							disabled={ this.state.submitting }>
							{ this.translate( 'Update Settings And Continue' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}

} );
export default Locked;
