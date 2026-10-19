import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from '../constants';
import ProductCard from '../product-card';
import ProductGridSection from '../product-grid/section';
import slugToSelectorProduct from '../slug-to-selector-product';
import { getItemSlugByDuration } from './utils';
import type { PlanRecommendation } from './types';
import type { Duration, PurchaseCallback, PurchaseURLCallback, SelectorProduct } from '../types';
import './style.scss';
import type { ReactNode, FC } from 'react';

type Props = {
	planRecommendation: PlanRecommendation;
	duration: Duration;
	filterBar: ReactNode;
	onSelectProduct: PurchaseCallback;
	createButtonURL?: PurchaseURLCallback;
};

const PlanUpgradeSection: FC< Props > = ( {
	planRecommendation,
	duration,
	filterBar,
	onSelectProduct,
	createButtonURL,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	let [ legacyPlan, newPlans ] = planRecommendation;

	legacyPlan = getItemSlugByDuration( legacyPlan, duration );
	newPlans = newPlans.map( ( p ) => getItemSlugByDuration( p, duration ) );

	const legacyItem = slugToSelectorProduct( legacyPlan ) as SelectorProduct;
	const newItems = newPlans.map( slugToSelectorProduct ) as SelectorProduct[];
	const newItemCount = newItems.length;

	return (
		<ProductGridSection
			title={ translate( 'We recommend {{product/}} based on your selection', {
				components: {
					product: (
						<span className="plan-upgrade__product">
							{ newItems.reduce(
								( result: ReactNode[], { displayName }: SelectorProduct, index: number ) => {
									if ( result.length === 0 ) {
										return [ displayName ];
									}

									if ( index === newItemCount - 1 ) {
										return [ ...result, ' & ', displayName ];
									}

									return [ ...result, ', ', displayName ];
								},
								[]
							) }
						</span>
					),
				},
			} ) }
			className={ clsx( { 'with-single-reco': newItemCount === 1 } ) }
		>
			<p className="plan-upgrade__description">
				{ translate(
					"Jetpack has introduced new flexible plans and pricing options. As an added bonus, we're offering {{b}}%(percentage)s% off{{/b}} your first term.",
					{
						args: {
							percentage: INTRO_PRICING_DISCOUNT_PERCENTAGE,
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</p>
			{ filterBar }
			<ul className="plan-upgrade__list">
				<li className="plan-upgrade__legacy-item">
					<ProductCard
						item={ legacyItem }
						siteId={ siteId }
						currencyCode={ currencyCode }
						selectedTerm={ duration }
						hideSavingLabel
						onClick={ onSelectProduct }
						createButtonURL={ createButtonURL }
					/>
				</li>
				<li className="plan-upgrade__separator">
					<span className="plan-upgrade__arrow">→</span>
				</li>
				<li className="plan-upgrade__new-items">
					<ul className="plan-upgrade__new-items-list">
						{ newItems.map( ( product ) => (
							<li key={ product.iconSlug }>
								<ProductCard
									item={ product }
									siteId={ siteId }
									currencyCode={ currencyCode }
									selectedTerm={ duration }
									featuredLabel={ translate( 'Recommended for you' ) }
									isAligned
									hideSavingLabel
									onClick={ onSelectProduct }
									createButtonURL={ createButtonURL }
								/>
							</li>
						) ) }
					</ul>
				</li>
			</ul>
		</ProductGridSection>
	);
};

export default PlanUpgradeSection;
