/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

class EmailPlanSubscription extends React.Component {
	renderDefaultRenewButton() {
		const { domain, purchase, selectedSite, isLoadingPurchase, translate } = this.props;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if ( ! purchase && ! isLoadingPurchase ) {
			return null;
		}

		return (
			<RenewButton
				compact={ true }
				purchase={ purchase }
				selectedSite={ selectedSite }
				subscriptionId={ parseInt( purchase.id, 10 ) }
				tracksProps={ { source: 'email-plan-view' } }
				customLabel={ translate( 'Renew now' ) }
			/>
		);
	}

	renderAutoRenewToggle() {
		const { selectedSite, purchase } = this.props;

		if ( ! purchase ) {
			return null;
		}

		return (
			<AutoRenewToggle
				planName={ selectedSite.plan.product_name_short }
				siteDomain={ selectedSite.domain }
				purchase={ purchase }
				withTextStatus={ true }
				toggleSource="email-plan-view"
			/>
		);
	}

	render() {
		const { purchase, isLoadingPurchase, moment, translate } = this.props;

		if ( ! purchase && isLoadingPurchase ) {
			return (
				<CompactCard className="email-plan-subscription__card email-plan-subscription__placeholder">
					<div />
					<div />
					<div />
				</CompactCard>
			);
		}

		if ( ! purchase ) {
			return null;
		}

		return (
			<CompactCard className="email-plan-subscription__card">
				<div>
					{ translate( 'Expires: %(expiryDate)s', {
						args: {
							expiryDate: moment.utc( purchase.expiryDate ).format( 'LL' ),
						},
					} ) }
				</div>
				<div>{ this.renderDefaultRenewButton() }</div>
				<div>{ this.renderAutoRenewToggle() }</div>
			</CompactCard>
		);
	}
}

export default withLocalizedMoment( localize( EmailPlanSubscription ) );
