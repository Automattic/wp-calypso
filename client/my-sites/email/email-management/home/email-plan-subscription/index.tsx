import { CompactCard } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getRenewalPrice } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

type EmailPlanSubscriptionProps = {
	isLoadingPurchase: boolean;
	purchase?: Purchase;
	selectedSite: SiteDetails;
};

export const EmailPlanSubscription = ( {
	purchase,
	isLoadingPurchase,
	selectedSite,
}: EmailPlanSubscriptionProps ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

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

	const todayTimestamp = new Date().setUTCHours( 0, 0, 0, 0 );
	const expiryTimestamp = new Date( purchase.expiryDate ).getTime();
	const hasSubscriptionExpired = todayTimestamp > expiryTimestamp;

	const getDescription = () => {
		const formattedRenewalPrice = formatCurrency(
			getRenewalPrice( purchase ),
			purchase.currencyCode,
			{
				stripZeros: true,
			}
		);
		const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

		if ( hasSubscriptionExpired ) {
			return translate( 'Expired on %(expiryDate)s.', {
				args: {
					expiryDate: moment( purchase.expiryDate ).format( 'LL' ),
				},
				comment: 'Shows the expiry date of the email subscription',
			} );
		}

		return purchase.isAutoRenewEnabled
			? translate( 'Renews on %(expiryDate)s for %(formattedRenewalPrice)s', {
					args: {
						expiryDate,
						formattedRenewalPrice,
					},
					comment: 'Shows the renews date and price of the email subscription',
			  } )
			: translate( 'Expires on %(expiryDate)s.', {
					args: {
						expiryDate: moment( purchase.expiryDate ).format( 'LL' ),
					},
					comment: 'Shows the expiry date of the email subscription',
			  } );
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
					subscriptionId={ purchase.id }
					tracksProps={ { source: 'email-plan-view' } }
					customLabel={ translate( 'Renew now' ) }
				/>
			</div>
			<div className="email-plan-subscription__auto-renew">
				<AutoRenewToggle
					planName={ selectedSite.plan?.product_name_short }
					siteDomain={ selectedSite.domain }
					purchase={ purchase }
					withTextStatus
					toggleSource="email-plan-view"
				/>
			</div>
		</CompactCard>
	);
};
