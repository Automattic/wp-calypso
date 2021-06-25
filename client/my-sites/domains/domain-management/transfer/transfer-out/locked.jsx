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
import { requestDomainTransferCode } from 'calypso/state/domains/transfer/actions';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';
import TransferOutWarning from './warning.jsx';
import { registrar as registrarNames } from 'calypso/lib/domains/constants';

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
		const { translate, selectedSite } = this.props;
		const { domain: domainName, privateDomain, registrar } = getSelectedDomain( this.props );

		return (
			<div>
				<Card className="transfer-out__card">
					<p>
						{ privateDomain && registrar === registrarNames.WWD
							? translate(
									'To transfer your domain, we must unlock it and remove Privacy Protection. Your contact information will be publicly available during the transfer period. The domain will remain unlocked and your contact information will be publicly available until the transfer is canceled or completed.'
							  )
							: translate(
									'To transfer your domain, we must unlock it. It will remain unlocked until the transfer is canceled or completed.'
							  ) }{ ' ' }
					</p>
					<TransferOutWarning domainName={ domainName } selectedSiteSlug={ selectedSite.slug } />
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
		requestDomainTransferCode,
	}
)( localize( Locked ) );
