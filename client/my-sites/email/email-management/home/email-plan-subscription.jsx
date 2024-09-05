import { CompactCard } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getRenewalPrice } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';

class EmailPlanSubscription extends Component {
	hasSubscriptionExpired() {
		const { isLoadingPurchase, purchase } = this.props;

		if ( isLoadingPurchase || ! purchase ) {
			return false;
		}

		const todayTimestamp = new Date().setUTCHours( 0, 0, 0, 0 );
		const expiryTimestamp = new Date( purchase.expiryDate ).getTime();

		return todayTimestamp > expiryTimestamp;
	}

	render() {
		const { purchase, isLoadingPurchase, moment, translate, selectedSite } = this.props;

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

		const getDescription = () => {
			const renewalPrice = getRenewalPrice( purchase );
			const currencyCode = purchase.currencyCode;
			const formattedRenewalPrice = formatCurrency( renewalPrice, currencyCode, {
				stripZeros: true,
			} );
			const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

			if ( purchase.isAutoRenewEnabled && ! hasSubscriptionExpired ) {
				return translate( 'Renews on %(expiryDate)s for %(formattedRenewalPrice)s', {
					args: {
						expiryDate,
						formattedRenewalPrice,
					},
					comment: 'Shows the renews date and price of the email subscription',
				} );
			}

			return (
				<>
					{ hasSubscriptionExpired
						? translate( 'Expired on %(expiryDate)s.', {
								args: {
									expiryDate: moment( purchase.expiryDate ).format( 'LL' ),
								},
								comment: 'Shows the expiry date of the email subscription',
						  } )
						: translate( 'Expires on %(expiryDate)s.', {
								args: {
									expiryDate: moment( purchase.expiryDate ).format( 'LL' ),
								},
								comment: 'Shows the expiry date of the email subscription',
						  } ) }
					<span className="email-plan-subscription__description-renews-date">
						{ translate( 'Renew for %(formattedRenewalPrice)s', {
							args: {
								formattedRenewalPrice,
							},
							comment: 'Shows the renews price of the email subscription',
						} ) }
					</span>
				</>
			);
		};

		return (
			<CompactCard className="email-plan-subscription__card">
				<div
					className={ clsx( 'email-plan-subscription__description', {
						'email-plan-subscription__description--expired': hasSubscriptionExpired,
					} ) }
				>
					{ getDescription() }
				</div>
				<div className="email-plan-subscription__renew">
					<RenewButton
						compact
						purchase={ purchase }
						primary={ hasSubscriptionExpired }
						selectedSite={ selectedSite }
						subscriptionId={ parseInt( purchase.id, 10 ) }
						tracksProps={ { source: 'email-plan-view' } }
						customLabel={ translate( 'Renew now' ) }
					/>
				</div>
				<div className="email-plan-subscription__auto-renew">
					<AutoRenewToggle
						planName={ selectedSite.plan.product_name_short }
						siteDomain={ selectedSite.domain }
						purchase={ purchase }
						withTextStatus
						toggleSource="email-plan-view"
					/>
				</div>
			</CompactCard>
		);
	}
}

export default withLocalizedMoment( localize( EmailPlanSubscription ) );
