import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import { getProductPricingInfo } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useSelector } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';

type Props = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct ) => void;
};

export default function PressablePlanSelectorCard( { plan, onSelect }: Props ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );

	const { discountedCost } = plan
		? getProductPricingInfo( userProducts, plan, 1 )
		: { discountedCost: 0 };

	const ctaLabel = useMemo( () => {
		return translate( 'Add %(planName)s to cart', {
			args: {
				planName: plan.name,
			},
			comment: '%(planName)s is the name of the plan.',
		} );
	}, [ plan.name, translate ] );

	return (
		<div className="pressable-plan-card-content">
			<div className="pressable-plan-card-content__top">
				<img className="pressable-plan-card-content__logo" src={ PressableLogo } alt="Pressable" />

				<div className="pressable-plan-card-content__price">
					<b className="pressable-plan-card-content__price-actual-value">
						{ formatCurrency( discountedCost, plan.currency ) }
					</b>

					<div className="pressable-plan-card-content__price-interval">
						{ plan.price_interval === 'day' && translate( 'per day, billed monthly' ) }
						{ plan.price_interval === 'month' && translate( 'per month, billed monthly' ) }
					</div>
				</div>
			</div>

			<Button
				className="pressable-plan-card-content__cta-button"
				variant="primary"
				onClick={ () => onSelect( plan ) }
			>
				{ ctaLabel }
			</Button>
		</div>
	);
}
