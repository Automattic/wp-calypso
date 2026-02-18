import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { EXTERNAL_PRESSABLE_AUTH_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useGetProductPricingInfo } from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-marketplace';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import type { TermPricingType } from 'calypso/a8c-for-agencies/sections/marketplace/types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct ) => void;
	isReferralMode?: boolean;
	pressableOwnership?: 'agency' | 'regular' | 'none';
	termPricing: TermPricingType;
};

export default function RegularPlanCardContent( {
	plan,
	onSelect,
	isReferralMode,
	pressableOwnership,
	termPricing,
}: Props ) {
	const translate = useTranslate();

	const { getProductPricingInfo } = useGetProductPricingInfo( termPricing, plan.currency );

	const userProducts = useSelector( getProductsList );

	const { discountedCostFormatted, actualCostFormatted, showActualCost, discountPercentage } = plan
		? getProductPricingInfo( userProducts, plan, 1 )
		: {
				discountedCostFormatted: '',
				actualCostFormatted: '',
				showActualCost: false,
				discountPercentage: 0,
		  };

	const ctaLabel = useMemo( () => {
		if ( isReferralMode ) {
			return translate( 'Add %(planName)s to referral', {
				args: {
					planName: plan.name.replace( /Pressable/g, '' ),
				},
				comment: '%(planName)s is the name of the plan.',
			} );
		}

		return translate( 'Add %(planName)s to cart', {
			args: {
				planName: plan.name.replace( /Pressable/g, '' ),
			},
			comment: '%(planName)s is the name of the plan.',
		} );
	}, [ isReferralMode, plan.name, translate ] );

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const priceInterval = () => {
		if ( isTermPricingEnabled ) {
			return termPricing === 'yearly' ? translate( 'per year' ) : translate( 'per month' );
		}
		if ( plan.price_interval === 'day' ) {
			return translate( 'per day, billed monthly' );
		}
		if ( plan.price_interval === 'month' ) {
			return translate( 'per month, billed monthly' );
		}
		return '';
	};

	return (
		<div className="pressable-plan-card-content">
			<div className="pressable-plan-card-content__top">
				<img className="pressable-plan-card-content__logo" src={ PressableLogo } alt="Pressable" />

				{ pressableOwnership === 'regular' ? (
					<div className="pressable-plan-card-content__regular-ownership-text">
						{ translate(
							'{{b}}You own this plan.{{/b}} Manage your hosting seamlessly by accessing the Pressable dashboard',
							{
								components: { b: <b /> },
							}
						) }
					</div>
				) : (
					<div className="pressable-plan-card-content__price">
						<div className="pressable-plan-card-content__price-row">
							<b className="pressable-plan-card-content__price-actual-value">
								{ discountedCostFormatted }
							</b>
							{ isTermPricingEnabled &&
								showActualCost &&
								( pressableOwnership === 'none' || isReferralMode ) && (
									<>
										<span className="pressable-plan-card-content__price-original">
											{ actualCostFormatted }
										</span>
										<span className="pressable-plan-card-content__price-discount">
											{ translate( 'Save %(discountPercentage)s%%*', {
												args: {
													discountPercentage,
												},
												comment:
													'%(discountPercentage)s is the discount percentage. The asterisk indicates limited time offer.',
											} ) }
										</span>
									</>
								) }
						</div>

						<div className="pressable-plan-card-content__price-interval">{ priceInterval() }</div>
					</div>
				) }
			</div>
			{ pressableOwnership === 'regular' ? (
				<Button
					className="pressable-plan-card-content__cta-button"
					variant="secondary"
					target="_blank"
					rel="norefferer nooppener"
					href={ EXTERNAL_PRESSABLE_AUTH_URL }
					__next40pxDefaultSize
				>
					{ translate( 'Manage in Pressable ↗' ) }
				</Button>
			) : (
				<div className="pressable-plan-card-content__cta-section">
					{ isTermPricingEnabled &&
						showActualCost &&
						( pressableOwnership === 'none' || isReferralMode ) && (
							<span className="pressable-plan-card-content__promo-footnote">
								{ translate( '*Limited time only. {{a}}See details{{/a}} ↗', {
									components: {
										a: (
											<a
												href="https://pressable.com/legal/hosting-promotion-terms/"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								} ) }
							</span>
						) }
					<Button
						className="pressable-plan-card-content__cta-button"
						variant="primary"
						onClick={ () => onSelect( plan ) }
					>
						{ ctaLabel }
					</Button>
				</div>
			) }
		</div>
	);
}
