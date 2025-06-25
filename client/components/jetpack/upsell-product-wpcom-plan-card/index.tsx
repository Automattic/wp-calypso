import {
	TERM_ANNUALLY,
	getPlan,
	getPlanFeaturesObject,
	Plan,
	PlanSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import BackupImage from 'calypso/assets/images/jetpack/rna-image-backup.png';
import DefaultImage from 'calypso/assets/images/jetpack/rna-image-default.png';
import ScanImage from 'calypso/assets/images/jetpack/rna-image-scan.png';
import SearchImage from 'calypso/assets/images/jetpack/rna-image-search.png';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

interface UpsellProductWpcomPlanCardProps {
	nonManageProductSlug: string;
	WPcomPlanSlug: PlanSlug;
	siteId: number | null;
	onCtaButtonClick: () => void;
}

export const UpsellProductWpcomPlanCard: React.FC< UpsellProductWpcomPlanCardProps > = ( {
	nonManageProductSlug,
	WPcomPlanSlug,
	siteId,
	onCtaButtonClick,
} ) => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const item = slugToSelectorProduct( nonManageProductSlug ) as SelectorProduct;
	const plan = getPlan( WPcomPlanSlug ) as Plan;
	const planSlug = plan.getStoreSlug();
	const jetpackFeatures = plan?.get2023PricingGridSignupJetpackFeatures?.();
	const jetpackFeaturesObject = getPlanFeaturesObject( jetpackFeatures );
	const siteProduct = useSelector( ( state ) =>
		getSiteAvailableProduct( state, siteId, planSlug )
	);

	const billingTerm: Duration = TERM_ANNUALLY;
	const ctaButtonURL: string = `https://wordpress.com/checkout/${ selectedSiteSlug }/${ planSlug }?redirect_to=${ encodeURIComponent(
		window.location.href
	) }`;
	const secondaryCtaURL: string = `https://wordpress.com/plans/${ selectedSiteSlug }`;
	const isFetchingPrices: boolean = ! siteProduct;
	const originalPrice: number = siteProduct?.cost_smallest_unit ?? 0;
	const displayPrice: number = ( siteProduct?.cost ?? 0 ) / 12;

	const ctaButtonLabel = translate( 'Get %(productName)s plan', {
		args: {
			productName: plan.getTitle(),
			context: 'The Plan name, ie- Starter, Explorer, Creator,.',
		},
	} );

	const upsellImageAlt = translate( 'Get %(productName)s plan', {
		args: {
			productName: plan.getTitle(),
			context: 'The Plan name, ie- Starter, Explorer, Creator,.',
		},
		textOnly: true,
	} );

	const upsellImageUrl = useMemo( () => {
		if ( isJetpackBackupSlug( nonManageProductSlug ) ) {
			return BackupImage;
		}
		if ( isJetpackScanSlug( nonManageProductSlug ) ) {
			return ScanImage;
		}
		if ( isJetpackSearchSlug( nonManageProductSlug ) ) {
			return SearchImage;
		}
		return DefaultImage;
	}, [ nonManageProductSlug ] );

	const { displayName, description } = item;

	const renderPriceDetails = () => {
		return (
			<>
				<div className="display-price__details" aria-hidden="true">
					<span className="display-price__billing-time-frame">
						{ translate( 'per month, %(rawPrice)s billed annually, excl. taxes', {
							args: {
								rawPrice: ! isFetchingPrices
									? formatCurrency( originalPrice ?? 0, currencyCode ?? '', {
											stripZeros: true,
											isSmallestUnit: true,
									  } )
									: '',
							},
							comment: 'Excl. Taxes is short for excluding taxes',
						} ) }
					</span>
				</div>
			</>
		);
	};

	const renderProductCardBody = () => {
		return (
			<>
				<div className="upsell-product-card__price-plan">Creator plan</div>
				<div className="upsell-product-card__price-container">
					<DisplayPrice
						isFree={ ! isFetchingPrices && originalPrice === 0 }
						currencyCode={ currencyCode }
						originalPrice={ displayPrice ?? 0 }
						pricesAreFetching={ isFetchingPrices }
						billingTerm={ billingTerm }
						productName={ displayName }
						hideSavingLabel={ false }
						customTimeFrameBillingTerms={ renderPriceDetails() }
					/>
				</div>
				<div className="upsell-product-card__included" aria-hidden="true">
					{ translate( 'Included with the %(planName)s plan:', {
						args: {
							planName: plan.getTitle(),
						},
					} ) }
				</div>
				<ul className="upsell-product-card__features is-wpcom-features">
					{ jetpackFeaturesObject &&
						jetpackFeaturesObject.map( ( feature, i ) => (
							<li className="upsell-product-card__features-item" key={ i }>
								<>
									<Gridicon size={ 18 } icon="checkmark" /> { feature.getTitle() }
								</>
							</li>
						) ) }
				</ul>
			</>
		);
	};

	return (
		<div className="upsell-product-wpcom-plan-card">
			<JetpackRnaActionCard
				headerText={ displayName }
				subHeaderText={ description }
				onCtaButtonClick={ onCtaButtonClick }
				ctaButtonURL={ ctaButtonURL }
				ctaButtonLabel={ ctaButtonLabel }
				ctaTracksEvent="calypso_jetpack_upsell_product_wpcom_plan_cta_click"
				cardImage={ upsellImageUrl }
				cardImageAlt={ upsellImageAlt }
				secondaryCtaURL={ secondaryCtaURL }
				secondaryCtaLabel={ translate( 'See all plans' ) }
				secondaryCtaTracksEvent="calypso_jetpack_upsell_product_wpcom_plan_see_all_plans_cta_click"
			>
				{ renderProductCardBody() }
			</JetpackRnaActionCard>
		</div>
	);
};

export default UpsellProductWpcomPlanCard;
