import {
	FEATURE_RECURRING_PAYMENTS,
	TYPE_PREMIUM,
	findFirstSimilarPlanKey,
	getPlan,
	isBloggerPlan,
	isFreePlan,
	isPersonalPlan,
	isWpComPlan,
} from '@automattic/calypso-products';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import PromoCard, { PromoCardVariation } from 'calypso/components/promo-section/promo-card';
import PromoCardCta from 'calypso/components/promo-section/promo-card/cta';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useDispatch } from 'calypso/state';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getUpsellCheckoutQueryArgs, getUpsellReturnUrl } from '../upsell-return-url';
import type { IsEligibleForOneClickCheckoutReturnValue } from 'calypso/my-sites/checkout/purchase-modal/use-is-eligible-for-one-click-checkout';

const loadPurchaseModalWrapper = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-upsell-nudge-purchase-modal-wrapper" */ 'calypso/blocks/upsell-nudge/purchase-modal-wrapper'
	);
const loadIsEligibleForOneClickCheckoutWrapper = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-checkout-purchase-modal-is-eligible-for-one-click-checkout-wrapper" */ 'calypso/my-sites/checkout/purchase-modal/is-eligible-for-one-click-checkout-wrapper'
	);

const upgradeNudgeProperties = {
	cta_name: 'calypso_earn_page_payment_plans_upgrade_nudge',
	cta_feature: FEATURE_RECURRING_PAYMENTS,
	cta_size: 'regular',
};

type Props = {
	siteSlug?: string;
	sitePlanSlug?: string;
};

type UpgradeCardProps = Props & {
	upgradePlanSlug?: string;
	isEligibleForOneClickCheckout?: IsEligibleForOneClickCheckoutReturnValue;
};

/**
 * The Premium plan on the site's billing term, for the sites that can buy it
 * from here. Jetpack Cloud and plans outside WordPress.com keep the plans page,
 * and so does any plan that Premium would not be an upgrade from.
 */
function getUpgradePlanSlug( sitePlanSlug?: string ): string | undefined {
	if ( isJetpackCloud() || ! sitePlanSlug || ! isWpComPlan( sitePlanSlug ) ) {
		return undefined;
	}

	if (
		! isFreePlan( sitePlanSlug ) &&
		! isBloggerPlan( sitePlanSlug ) &&
		! isPersonalPlan( sitePlanSlug )
	) {
		return undefined;
	}

	return findFirstSimilarPlanKey( sitePlanSlug, { type: TYPE_PREMIUM } );
}

function UpgradeCard( {
	siteSlug,
	upgradePlanSlug,
	isEligibleForOneClickCheckout,
}: UpgradeCardProps ) {
	const dispatch = useDispatch();
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );

	const trackUpgrade = () => {
		dispatch(
			recordTracksEvent(
				'calypso_earn_page_payment_plans_upgrade_button_click',
				upgradeNudgeProperties
			)
		);
		dispatch( bumpStat( 'calypso_earn_page', 'payment-plans-upgrade-button' ) );
	};

	const canCheckOut = Boolean( siteSlug && upgradePlanSlug );
	const url = canCheckOut
		? addQueryArgs( `/checkout/${ siteSlug }/${ upgradePlanSlug }`, getUpsellCheckoutQueryArgs() )
		: addQueryArgs( `/plans/${ siteSlug }`, { redirect_to: getUpsellReturnUrl() } );
	const planTitle = upgradePlanSlug ? getPlan( upgradePlanSlug )?.getTitle() : undefined;
	const planName = typeof planTitle === 'string' ? planTitle : undefined;

	return (
		<>
			{ showPurchaseModal && (
				<AsyncLoad
					require={ loadPurchaseModalWrapper }
					placeholder={ null }
					plan={ upgradePlanSlug }
					siteSlug={ siteSlug }
					setShowPurchaseModal={ setShowPurchaseModal }
				/>
			) }
			<PromoCard
				variation={ PromoCardVariation.Compact }
				icon="credit-card"
				title={ preventWidows( __( 'Upgrade to modify payment plans or add new plans' ) ) }
			>
				<p>
					{ preventWidows(
						__(
							'Payment plans let you charge for memberships, subscriptions, and one-time offers.'
						)
					) }
				</p>
				<PromoCardCta
					cta={ {
						text:
							canCheckOut && planName
								? sprintf(
										/* translators: %(planName)s is the name of a plan, e.g. Premium */
										__( 'Upgrade to %(planName)s' ),
										{ planName }
									)
								: __( 'Upgrade' ),
						isPrimary: true,
						action:
							canCheckOut && isEligibleForOneClickCheckout?.result === true
								? () => {
										trackUpgrade();
										setShowPurchaseModal( true );
									}
								: { url, onClick: trackUpgrade, selfTarget: true },
					} }
				/>
			</PromoCard>
		</>
	);
}

export default function PaymentsUpgradeCard( { siteSlug, sitePlanSlug }: Props ) {
	const upgradePlanSlug = getUpgradePlanSlug( sitePlanSlug );
	const cardProps = { siteSlug, sitePlanSlug, upgradePlanSlug };

	return (
		<>
			<TrackComponentView
				eventName="calypso_earn_page_payment_plans_upgrade_button_view"
				eventProperties={ upgradeNudgeProperties }
			/>
			{ upgradePlanSlug ? (
				<AsyncLoad
					require={ loadIsEligibleForOneClickCheckoutWrapper }
					placeholder={ <UpgradeCard { ...cardProps } /> }
					component={ UpgradeCard }
					componentProps={ cardProps }
				/>
			) : (
				<UpgradeCard { ...cardProps } />
			) }
		</>
	);
}
