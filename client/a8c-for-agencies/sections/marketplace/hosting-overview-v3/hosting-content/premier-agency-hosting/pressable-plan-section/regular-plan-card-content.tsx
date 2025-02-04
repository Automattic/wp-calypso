import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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

	const { getProductPricingInfo } = useGetProductPricingInfo();

	const { discountedCost } = plan
		? getProductPricingInfo( userProducts, plan, 1 )
		: { discountedCost: 0 };

	const ctaLabel = useMemo( () => {
		if ( isReferralMode ) {
			return translate( 'Add %(planName)s to referral', {
				args: {
					planName: plan.name,
				},
				comment: '%(planName)s is the name of the plan.',
			} );
		}

		return translate( 'Add %(planName)s to cart', {
			args: {
				planName: plan.name,
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
						<b className="pressable-plan-card-content__price-actual-value">
							{ formatCurrency( discountedCost, plan.currency ) }
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
				>
					{ translate( 'Manage in Pressable' ) } <Icon icon={ external } size={ 18 } />
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
