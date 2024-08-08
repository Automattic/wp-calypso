import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useMemo, useState } from 'react';
import A4ANumberInput from 'calypso/a8c-for-agencies/components/a4a-number-input';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import SimpleList from 'calypso/a8c-for-agencies/sections/marketplace/common/simple-list';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import { getWPCOMCreatorPlan } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import WPCOMBulkSelector from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/bulk-selection';
import {
	DiscountTier,
	calculateTier,
} from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-values-utils';
import useWPCOMPlanDescription from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/wpcom-card/hooks/use-wpcom-plan-description';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useWPCOMDiscountTiers from '../../../hooks/use-wpcom-discount-tiers';

import './style.scss';

type PlanDetailsProps = {
	plan: APIProductFamilyProduct;
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	ownedPlans: number;
	referralMode?: boolean;
	quantity: number;
	setQuantity: ( quantity: number ) => void;
};

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
				<div className="wpcom-plan-selector__cta-label">
					{ translate( 'How many sites would you like to buy?' ) }
				</div>

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

	const discountTiers = useWPCOMDiscountTiers();

	const [ selectedTier, setSelectedTier ] = useState< DiscountTier >( discountTiers[ 0 ] );

	const [ quantity, setQuantity ] = useState(
		selectedTier.value ? Number( selectedTier.value ) : 1
	);

	const handleSetSelectedTier = ( tier: DiscountTier ) => {
		setSelectedTier( tier );
		// If the user already owns plans, set the quantity to the difference between the selected tier and the owned plans
		setQuantity( ownedPlans ? Number( tier.value ) - ownedPlans : Number( tier.value ) );
	};

	const handleSetQuantity = ( value: number ) => {
		if ( value ) {
			setQuantity( value );
			const tier = discountTiers.find( ( tier ) => tier.value === value );
			if ( tier ) {
				if ( tier.value < 10 ) {
					setSelectedTier( tier );
				} else {
					setSelectedTier(
						discountTiers.find( ( { value } ) => value === 10 ) ?? discountTiers[ 0 ]
					);
				}
			}
		}
	};

	useEffect( () => {
		if ( isLicenseCountsReady ) {
			setQuantity(
				ownedPlans ? Number( selectedTier.value ) - ownedPlans : Number( selectedTier.value )
			);
		}
	}, [ isLicenseCountsReady, ownedPlans, selectedTier.value ] );

	if ( ! plan ) {
		return;
	}

	return (
		<div className="wpcom-plan-selector">
			<div className="wpcom-plan-selector__slider-container">
				{ ! referralMode && (
					<WPCOMBulkSelector
						selectedTier={ selectedTier }
						onSelectTier={ handleSetSelectedTier }
						quantity={ quantity }
						ownedPlans={ ownedPlans }
						isLoading={ ! isLicenseCountsReady }
						hideOwnedPlansBadge
						hideNumberInput
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
						quantity={ quantity }
						setQuantity={ handleSetQuantity }
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
