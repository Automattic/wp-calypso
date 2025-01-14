import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo, useState } from 'react';
import A4ANumberInput from 'calypso/a8c-for-agencies/components/a4a-number-input';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import useWPCOMPlanDescription from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-wpcom-plan-description';
import { getWPCOMCreatorPlan } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import { calculateTier } from 'calypso/a8c-for-agencies/sections/marketplace/lib/wpcom-bulk-values-utils';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useWPCOMDiscountTiers from '../../../hooks/use-wpcom-discount-tiers';
import WPCOMPlanSlider from './slider';

import './style.scss';

type PlanDetailsProps = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	ownedPlans: number;
	referralMode?: boolean;
	quantity: number;
	setQuantity: ( quantity: number ) => void;
};

const MAX_PLANS_FOR_SLIDER = 10;

function PlanDetails( {
	plan,
	onSelect,
	ownedPlans,
	referralMode,
	quantity,
	setQuantity,
}: PlanDetailsProps ) {
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

			<h2 className="wpcom-plan-selector__plan-name">{ planName }</h2>

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
					{ plan.price_interval === 'day' && translate( 'per day' ) }
					{ plan.price_interval === 'month' && translate( 'per month' ) }
				</div>
			</div>

			<div className="wpcom-plan-selector__cta">
				{ ! referralMode && (
					<div className="wpcom-plan-selector__cta-label">
						{ translate( 'How many sites would you like to buy?' ) }
					</div>
				) }
				<div className="wpcom-plan-selector__cta-component">
					<Button
						className="wpcom-plan-selector__cta-button"
						variant="primary"
						onClick={ () => onSelect( plan, quantity ) }
					>
						{ ctaLabel }
					</Button>

					{ ! referralMode && <A4ANumberInput value={ quantity } onChange={ setQuantity } /> }
				</div>
			</div>
		</div>
	);
}

function PlanDetailsPlaceholder() {
	return (
		<div className="wpcom-plan-selector__details is-placeholder">
			<div className="wpcom-plan-selector__owned-plan"></div>
			<div className="wpcom-plan-selector__plan-name"></div>
			<div className="wpcom-plan-selector__price"></div>
			<div className="wpcom-plan-selector__price-interval"></div>
			<div className="wpcom-plan-selector__cta">
				<div className="wpcom-plan-selector__cta-label"></div>
				<div className="wpcom-plan-selector__cta-component"></div>
			</div>
		</div>
	);
}

type WPCOMPlanSelectorProps = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function WPCOMPlanSelector( { onSelect }: WPCOMPlanSelectorProps ) {
	const translate = useTranslate();

	const { count, isReady: isLicenseCountsReady } = useWPCOMOwnedSites();

	const { wpcomPlans } = useProductAndPlans( {} );

	const plan = getWPCOMCreatorPlan( wpcomPlans ) ?? wpcomPlans[ 0 ];

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const referralMode = marketplaceType === 'referral';

	const ownedPlans = useMemo( () => {
		if ( referralMode ) {
			return 0;
		}

		return count;
	}, [ count, referralMode ] );

	const [ quantity, setQuantity ] = useState( 1 );

	if ( ! plan ) {
		return;
	}

	// Show the WPCOM slider if the user has less than 10 plans and is not in referral mode.
	const showWPCOMSlider = ! referralMode && ownedPlans < MAX_PLANS_FOR_SLIDER;

	const displayQuantity = referralMode ? 1 : quantity;

	return (
		<div
			className={ clsx( 'wpcom-plan-selector', {
				'is-slider-hidden': ! showWPCOMSlider,
			} ) }
		>
			<div className="wpcom-plan-selector__slider-container">
				{ showWPCOMSlider && (
					<WPCOMPlanSlider
						quantity={ displayQuantity }
						onChange={ setQuantity }
						ownedPlans={ ownedPlans }
					/>
				) }
			</div>

			<div className="wpcom-plan-selector__card">
				{ isLicenseCountsReady ? (
					<PlanDetails
						plan={ plan }
						onSelect={ onSelect }
						ownedPlans={ ownedPlans }
						referralMode={ referralMode }
						quantity={ displayQuantity }
						setQuantity={ setQuantity }
					/>
				) : (
					<PlanDetailsPlaceholder />
				) }

				<div className="wpcom-plan-selector__features">
					<SimpleList
						items={ [
							translate( '50GB of storage' ),
							translate( 'Unrestricted bandwidth' ),
							translate( 'Install your own plugins & themes' ),
							translate( 'High-burst capacity' ),
							translate( 'Web Application Firewall' ),
							translate( 'High-frequency CPUs' ),
							translate( 'Expert live chat & email support' ),
						] }
					/>
					<SimpleList
						items={ [
							translate( 'DDOS mitigation' ),
							translate( 'Free staging environment' ),
							translate( 'Managed malware protection' ),
							translate( 'Extremely fast DNS with SSL' ),
							translate( 'Centralized site management' ),
							translate( '10 PHP workers with auto-scaling' ),
						] }
					/>
				</div>
			</div>
		</div>
	);
}
