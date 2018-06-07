/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedDomain } from 'lib/domains';
import Button from 'components/button';
import { requestTransferCode } from 'lib/upgrades/actions';
import { displayRequestTransferCodeResponseNotice } from './shared';
import { TRANSFER_DOMAIN_REGISTRATION } from 'lib/url/support';
import Notice from 'components/notice';

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
				<Notice status="is-warning" showDismiss={ false }>
					{ translate(
						'Currently, many domain providers are experiencing difficulty with their ' +
							'processes for handling transfers due to changes required for The ' +
							'European Union’s {{gdpr}}General Data Protection Regulation{{/gdpr}}, ' +
							'which went into full effect on May 25, 2018. Please note this may ' +
							'impact your ability to transfer your domain from WordPress.com to ' +
							'other providers. {{learn}}Learn more.{{/learn}}',
						{
							components: {
								gdpr: (
									<a href="https://automattic.com/automattic-and-the-general-data-protection-regulation-gdpr/" />
								),
								learn: (
									<a href="https://en.support.wordpress.com/move-domain/transfer-domain-registration/#what-if-my-new-registrar-says-they-cant-start-my-transfer-because-my-contact-information-is-not-public" />
								),
							},
						}
					) }
				</Notice>
				<SectionHeader label={ translate( 'Transfer Domain' ) } />
				<Card className="transfer-card">
					<p>
						{ privateDomain
							? translate(
									'To transfer your domain, we must unlock it and remove Privacy Protection. ' +
										'Your contact information will be publicly available during the transfer period.'
								)
							: translate( 'To transfer your domain, we must unlock it.' ) }{' '}
						<a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer">
							{ translate( 'Learn More.' ) }
						</a>
					</p>
					{ this.isManualTransferRequired() && this.renderManualTransferInfo() }
					<Button
						className="transfer-out__action-button"
						onClick={ this.unlockAndRequestTransferCode }
						primary
						disabled={ this.state.submitting }
					>
						{ translate( 'Update Settings And Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( Locked );
