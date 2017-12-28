/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import SectionHeader from 'client/components/section-header';
import { getSelectedDomain } from 'client/lib/domains';
import Button from 'client/components/button';
import { requestTransferCode } from 'client/lib/upgrades/actions';
import { displayRequestTransferCodeResponseNotice } from './shared';
import support from 'client/lib/url/support';

class Locked extends React.Component {
	state = {
		submitting: false,
		showDialog: false,
	};

	unlockAndRequestTransferCode = () => {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName,
			unlock: true,
			disablePrivacy: privateDomain && hasPrivacyProtection,
		};

		this.setState( { submitting: true } );
		requestTransferCode( options, error => {
			if ( error ) {
				this.setState( { submitting: false } );
			}
			displayRequestTransferCodeResponseNotice( error, getSelectedDomain( this.props ) );
		} );
	};

	isManualTransferRequired() {
		return getSelectedDomain( this.props ).manualTransferRequired;
	}

	renderManualTransferInfo() {
		return (
			<p>
				{ this.props.translate(
					'This Top Level Domain (TLD) requires that we manually request a ' +
						'transfer code on your behalf. After we have received it, we will ' +
						'email it to you.'
				) }
			</p>
		);
	}

	render() {
		const { translate } = this.props;
		const { privateDomain } = getSelectedDomain( this.props );
		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain' ) } />
				<Card className="transfer-card">
					<div>
						<p>
							{ privateDomain
								? translate(
										'To transfer your domain, we must unlock it and remove Privacy Protection. ' +
											'Your contact information will be publicly available during the transfer period.'
									)
								: translate( 'To transfer your domain, we must unlock it.' ) }{' '}
							<a
								href={ support.TRANSFER_DOMAIN_REGISTRATION }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ translate( 'Learn More.' ) }
							</a>
						</p>
						{ this.isManualTransferRequired() && this.renderManualTransferInfo() }
						<Button
							className="transfer__action-button"
							onClick={ this.unlockAndRequestTransferCode }
							primary
							disabled={ this.state.submitting }
						>
							{ translate( 'Update Settings And Continue' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( Locked );
