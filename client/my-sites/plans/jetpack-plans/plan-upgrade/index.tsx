/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getItemSlugByDuration } from './utils';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from '../constants';
import ProductCard from '../product-card';
import ProductGridSection from '../product-grid/section';
import { slugToSelectorProduct } from '../utils';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Type dependencies
 */
import type { PlanRecommendation } from './types';
import type { Duration, PurchaseCallback, SelectorProduct } from '../types';

type Props = {
	planRecommendation: PlanRecommendation;
	duration: Duration;
	filterBar: React.ReactNode;
	onSelectProduct: PurchaseCallback;
};

const PlanUpgradeSection: React.FC< Props > = ( {
	planRecommendation,
	duration,
	filterBar,
	onSelectProduct,
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
							{ newItems.reduce( ( result, { displayName }, index ) => {
								if ( result.length === 0 ) {
									return [ displayName ];
								}

								if ( index === newItemCount - 1 ) {
									return [ ...result, ' & ', displayName ];
								}

								return [ ...result, ', ', displayName ];
							}, [] ) }
						</span>
					),
				},
			} ) }
			className={ classNames( { 'with-single-reco': newItemCount === 1 } ) }
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
					/>
				</li>
				<li className="plan-upgrade__separator">
					<span className="plan-upgrade__arrow">{ '→' }</span>
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
									featuredPlans={ newPlans }
									featuredLabel={ translate( 'Recommended for you' ) }
									isAligned
									hideSavingLabel
									onClick={ onSelectProduct }
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
