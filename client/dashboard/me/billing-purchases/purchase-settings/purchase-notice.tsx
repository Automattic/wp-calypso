import { DomainProductSlugs, DotcomPlans } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { differenceInCalendarDays } from 'date-fns';
import { useAnalytics } from '../../../app/analytics';
import Notice from '../../../components/notice';
import { isExpired } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

export function PurchaseNotice( { purchase }: { purchase: Purchase } ) {
	if ( purchase.async_pending_payment_block_is_set ) {
		return (
			<Notice variant="warning">
				{ __(
					'There is currently a payment processing for this subscription. Please wait for the payment to complete before attempting to make any changes.'
				) }
			</Notice>
		);
	}
	if ( purchase.product_slug === DomainProductSlugs.TRANSFER_IN ) {
		return null;
	}

	if (
		purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY ||
		purchase.product_slug === DotcomPlans.MIGRATION_TRIAL_MONTHLY ||
		purchase.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY
	) {
		return <TrialNotice purchase={ purchase } />;
	}

	// FIXME: add all the other things in PurchaseNotice
}

function TrialNotice( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();
	const onClickUpgrade = () => {
		const isEcommerceTrialMonthly = purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY;

		if ( isEcommerceTrialMonthly ) {
			recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
				current_plan_slug: purchase.product_slug,
				to_checkout: false,
			} );

			window.location.href = `/plans/${ purchase.site_slug ?? '' }`;
			return;
		}

		recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
			current_plan_slug: purchase.product_slug,
			to_checkout: true,
			upgrade_plan_slug: 'business',
		} );

		const siteSlug = purchase.site_slug ?? purchase.blog_id;
		window.location.href = `/checkout/${ siteSlug }/business?redirectTo=/plans/my-plan/trial-upgraded/${ siteSlug }`;
		return;
	};

	const daysToExpiry = isExpired( purchase )
		? 0
		: differenceInCalendarDays( new Date( purchase.expiry_date ), new Date() );
	const productType =
		purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY
			? __( 'ecommerce' )
			: // translators: Business is a plan name
			  __( 'Business' );
	const noticeText = daysToExpiry
		? sprintf(
				// translators: %expiry is the number of days remaining on the trial, %productType is the type of product (e.g. ecommerce)
				_n(
					'You have %(expiry)s day remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
					'You have %(expiry)s days remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
					daysToExpiry
				),
				{
					expiry: daysToExpiry,
					productType: productType as string,
				}
		  )
		: sprintf(
				// translators: %productType is the type of product (e.g. ecommerce)
				__(
					'Your free trial has expired. Upgrade your plan to keep your %(productType)s features.'
				),
				{
					productType,
				}
		  );

	return (
		<Notice
			variant="info"
			actions={
				<Button variant="primary" onClick={ onClickUpgrade }>
					{ __( 'Upgrade now' ) }
				</Button>
			}
		>
			{ noticeText }
		</Notice>
	);
}
