/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	fetchWapiDomainInfo,
	requestDomainTransferCode,
} from 'calypso/state/domains/transfer/actions';
import { TRANSFER_DOMAIN_REGISTRATION } from 'calypso/lib/url/support';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';

class Locked extends React.Component {
	unlockAndRequestTransferCode = () => {
		const { privateDomain } = getSelectedDomain( this.props );

		const options = {
			siteId: this.props.selectedSite.ID,
			unlock: true,
			disablePrivacy: privateDomain,
		};

		this.props.requestDomainTransferCode( this.props.selectedDomainName, options );
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
				<Card className="transfer-out__card">
					<p>
						{ privateDomain
							? translate(
									'To transfer your domain, we must unlock it and remove Privacy Protection. ' +
										'Your contact information will be publicly available during the transfer period.'
							  )
							: translate( 'To transfer your domain, we must unlock it.' ) }{ ' ' }
						<a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer">
							{ translate( 'Learn More.' ) }
						</a>
					</p>
					{ this.isManualTransferRequired() && this.renderManualTransferInfo() }
					<Button
						className="transfer-out__action-button"
						onClick={ this.unlockAndRequestTransferCode }
						primary
						disabled={ this.props.isRequestingTransferCode }
					>
						{ translate( 'Update settings and continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const domainInfo = getDomainWapiInfoByDomainName( state, selectedDomainName );

		return {
			isRequestingTransferCode: !! domainInfo.isRequestingTransferCode,
		};
	},
	{
		fetchWapiDomainInfo,
		requestDomainTransferCode,
	}
)( localize( Locked ) );
