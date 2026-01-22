import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import { TermPricingContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import { useGetProductPricingInfo } from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-total-invoice-value';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import { useSelector } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';

type Props = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct ) => void;
	isReferralMode?: boolean;
	pressableOwnership?: 'agency' | 'regular' | 'none';
};

export default function PressablePlanSelectorCard( {
	plan,
	onSelect,
	isReferralMode,
	pressableOwnership,
}: Props ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );
	const { termPricing } = useContext( TermPricingContext );

	const { getProductPricingInfo } = useGetProductPricingInfo();

	const { discountedCost } = plan
		? getProductPricingInfo( userProducts, plan, 1 )
		: { discountedCost: 0 };

	// Look up the product in userProducts to check for introductory offer based on billing term
	const productIdForOffer =
		termPricing === 'yearly' ? plan?.yearly_product_id : plan?.monthly_product_id;
	const productWithOffer = productIdForOffer
		? Object.values( userProducts ).find( ( p ) => p.product_id === productIdForOffer )
		: null;

	const introductoryOffer = productWithOffer?.introductory_offer;
	const hasIntroductoryOffer = !! introductoryOffer?.cost_per_interval;

	// The introductory offer cost_per_interval is the price for the selected billing term
	const introductoryOfferCost = introductoryOffer?.cost_per_interval ?? 0;

	// Get the original price (before introductory offer) from the same product
	const originalPrice = productWithOffer?.cost ?? discountedCost;

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
						{ hasIntroductoryOffer && (
							<span className="pressable-plan-card-content__price-original">
								{ formatCurrency( originalPrice, plan.currency ) }
							</span>
						) }
						<b className="pressable-plan-card-content__price-actual-value">
							{ formatCurrency(
								hasIntroductoryOffer ? introductoryOfferCost : discountedCost,
								plan.currency
							) }
						</b>

						<div className="pressable-plan-card-content__price-interval">
							{ plan.price_interval === 'day' && translate( 'per day, billed monthly' ) }
							{ plan.price_interval === 'month' && translate( 'per month, billed monthly' ) }
						</div>
					</div>
				) }
			</div>
			{ pressableOwnership === 'regular' ? (
				<Button
					className="pressable-plan-card-content__cta-button"
					variant="secondary"
					target="_blank"
					rel="norefferer nooppener"
					href="https://my.pressable.com/agency/auth"
					__next40pxDefaultSize
				>
					{ translate( 'Manage in Pressable ↗' ) }
				</Button>
			) : (
				<Button
					className="pressable-plan-card-content__cta-button"
					variant="primary"
					onClick={ () => onSelect( plan ) }
				>
					{ ctaLabel }
				</Button>
			) }
		</div>
	);
}
