import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import A4ANumberInputV2 from 'calypso/a8c-for-agencies/components/a4a-number-input-v2';
import useWPCOMDiscountTiers from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-wpcom-discount-tiers';
import { calculateTier } from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-values-utils';
import useWPCOMPlanDescription from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/wpcom-card/hooks/use-wpcom-plan-description';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

type Props = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	ownedPlans: number;
	referralMode?: boolean;
	quantity: number;
	setQuantity: ( quantity: number ) => void;
};

function Placeholder() {
	return (
		<div className="wpcom-plan-selector__details is-placeholder">
			<div className="wpcom-plan-selector__owned-plan"></div>
			<div className="wpcom-plan-selector__plan-name"></div>
			<div className="wpcom-plan-selector__price"></div>
			<div className="wpcom-plan-selector__price-interval"></div>
			<div className="wpcom-plan-selector__cta">
				<div className="wpcom-plan-selector__cta-component"></div>
			</div>
		</div>
	);
}

export default function WPCOMPlanSelector( {
	plan,
	onSelect,
	ownedPlans,
	referralMode,
	quantity,
	setQuantity,
}: Props ) {
	const translate = useTranslate();

	const discountTiers = useWPCOMDiscountTiers();

	const discount = useMemo( () => {
		if ( referralMode ) {
			return discountTiers[ 0 ].discount;
		}

		return calculateTier( discountTiers, quantity + ownedPlans ).discount;
	}, [ discountTiers, ownedPlans, quantity, referralMode ] );

	const originalPrice = Number( plan?.amount ?? 0 ) * quantity;
	const actualPrice = originalPrice - originalPrice * discount;

	const { name: planName } = useWPCOMPlanDescription( plan?.slug ?? '' );

	const ctaLabel = useMemo( () => {
		if ( referralMode ) {
			return translate( 'Add to referral' );
		}

		return translate( 'Add %(quantity)s site to cart', 'Add %(quantity)s sites to cart', {
			args: {
				quantity,
				planName,
			},
			count: quantity,
			comment: '%(quantity)s is the quantity of plans and %(planName)s is the name of the plan.',
		} );
	}, [ planName, quantity, referralMode, translate ] );

	return (
		<div className="wpcom-plan-selector__details">
			{ ownedPlans > 0 && (
				<div className="wpcom-plan-selector__owned-plan">
					{ translate( 'You own %(count)s site', 'You own %(count)s sites', {
						args: {
							count: ownedPlans,
						},
						count: ownedPlans,
						comment: '%(count)s is the number of WordPress.com sites owned by the user',
					} ) }
				</div>
			) }

			<div className="wpcom-plan-selector__plan-name">
				<img src={ WPCOMLogo } alt="WPCOM" />
			</div>

			<div className="wpcom-plan-selector__price">
				<b className="wpcom-plan-selector__price-actual-value">
					{ formatCurrency( actualPrice, plan.currency ) }
				</b>
				{ !! discount && (
					<>
						<b className="wpcom-plan-selector__price-original-value">
							{ formatCurrency( originalPrice, plan.currency ) }
						</b>

						<span className="wpcom-plan-selector__price-discount">
							{ translate( 'You save %(discount)s%', {
								args: {
									discount: Math.floor( discount * 100 ),
								},
								comment: '%(discount)s is the discount percentage.',
							} ) }
						</span>
					</>
				) }
				<div className="wpcom-plan-selector__price-interval">
					{ plan.price_interval === 'day' && translate( 'per day, billed monthly' ) }
					{ plan.price_interval === 'month' && translate( 'per month, billed monthly' ) }
				</div>
			</div>

			<div className="wpcom-plan-selector__cta">
				<div className="wpcom-plan-selector__cta-component">
					<Button
						className="wpcom-plan-selector__cta-button"
						variant="primary"
						onClick={ () => onSelect( plan, quantity ) }
					>
						{ ctaLabel }
					</Button>

					{ ! referralMode && <A4ANumberInputV2 value={ quantity } onChange={ setQuantity } /> }
				</div>
			</div>
		</div>
	);
}

WPCOMPlanSelector.Placeholder = Placeholder;
