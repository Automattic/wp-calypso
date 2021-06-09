/**
 * External dependencies
 */
import classNames from 'classnames';
import { CompactCard } from '@automattic/components';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

class EmailPlanSubscription extends React.Component {
	hasSubscriptionExpired() {
		const { isLoadingPurchase, purchase } = this.props;

		if ( isLoadingPurchase || ! purchase ) {
			return false;
		}

		const todayTimestamp = new Date().setUTCHours( 0, 0, 0, 0 );
		const expiryTimestamp = new Date( purchase.expiryDate ).getTime();

		return todayTimestamp > expiryTimestamp;
	}

	renderRenewButton() {
		const { purchase, selectedSite, isLoadingPurchase, translate } = this.props;

		if ( ! purchase && ! isLoadingPurchase ) {
			return null;
		}

		return (
			<RenewButton
				compact={ true }
				purchase={ purchase }
				primary={ this.hasSubscriptionExpired() }
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

		const hasSubscriptionExpired = this.hasSubscriptionExpired();
		const translateArgs = {
			args: {
				expiryDate: moment.utc( purchase.expiryDate ).format( 'LL' ),
			},
			comment: 'Shows the expiry date of the email subscription',
		};
		const expiryText = hasSubscriptionExpired
			? translate( 'Expired: %(expiryDate)s', translateArgs )
			: translate( 'Expires: %(expiryDate)s', translateArgs );

		return (
			<CompactCard className="email-plan-subscription__card">
				<div
					className={ classNames( {
						'email-plan-subscription__expired': hasSubscriptionExpired,
					} ) }
				>
					{ expiryText }
				</div>
				<div className="email-plan-subscription__renew">{ this.renderRenewButton() }</div>
				<div className="email-plan-subscription__auto-renew">{ this.renderAutoRenewToggle() }</div>
			</CompactCard>
		);
	}
}

export default withLocalizedMoment( localize( EmailPlanSubscription ) );
