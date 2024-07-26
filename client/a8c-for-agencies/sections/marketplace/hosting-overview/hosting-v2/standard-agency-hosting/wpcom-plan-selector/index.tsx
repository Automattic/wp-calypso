import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo, useState } from 'react';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import SimpleList from 'calypso/a8c-for-agencies/sections/marketplace/common/simple-list';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import { getWPCOMCreatorPlan } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import WPCOMBulkSelector from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/bulk-selection';
import wpcomBulkOptions from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-options';
import { DiscountTier } from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-values-utils';
import useWPCOMPlanDescription from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/wpcom-card/hooks/use-wpcom-plan-description';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function WPCOMPlanSelector( { onSelect }: Props ) {
	const translate = useTranslate();

	const { data: licenseCounts, isSuccess: isLicenseCountsReady } = useFetchLicenseCounts();

	const { wpcomPlans } = useProductAndPlans( {} );

	const plan = getWPCOMCreatorPlan( wpcomPlans ) ?? wpcomPlans[ 0 ];

	const ownedPlans = useMemo( () => {
		if ( isLicenseCountsReady && plan ) {
			const productStats = licenseCounts?.products?.[ plan.slug ];
			return productStats?.not_revoked || 0;
		}
	}, [ isLicenseCountsReady, licenseCounts?.products, plan ] );

	const options = wpcomBulkOptions( [] );

	const [ selectedTier, setSelectedTier ] = useState< DiscountTier >( options[ 0 ] );

	const onSelectTier = ( tier: DiscountTier ) => {
		setSelectedTier( tier );
	};

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const referralMode = marketplaceType === 'referral';

	// For referral mode we only display 1 option.
	const quantity = referralMode ? 1 : ( selectedTier.value as number ) - ownedPlans;
	const discount = referralMode ? options[ 0 ].discount : selectedTier.discount;

	const originalPrice = Number( plan.amount ) * quantity;
	const actualPrice = originalPrice - originalPrice * discount;

	const { name: planName, features1, features2 } = useWPCOMPlanDescription( plan?.slug ?? '' );

	const ctaLabel = useMemo( () => {
		if ( referralMode ) {
			return translate( 'Add to referral' );
		}

		return quantity > 1
			? translate( 'Add %(quantity)s %(planName)s sites to cart', {
					args: {
						quantity,
						planName,
					},
					comment:
						'%(quantity)s is the quantity of plans and %(planName)s is the name of the plan.',
			  } )
			: translate( 'Add %(planName)s to cart', {
					args: {
						planName,
					},
					comment: '%(planName)s is the name of the plan.',
			  } );
	}, [ planName, quantity, referralMode, translate ] );

	return (
		<div className="wpcom-plan-selector">
			<div className="wpcom-plan-selector__slider-container">
				{ /* TODO: We will later replace these with different one on a separate PR */ }
				<WPCOMBulkSelector
					selectedTier={ selectedTier }
					onSelectTier={ onSelectTier }
					ownedPlans={ ownedPlans }
					isLoading={ ! isLicenseCountsReady }
					hideOwnedPlansBadge
					readOnly
				/>
			</div>

			<div className="wpcom-plan-selector__card">
				<div className="wpcom-plan-selector__details">
					<h2 className="wpcom-plan-selector__plan-name">{ planName }</h2>

					{ ! isLicenseCountsReady && (
						<div className="wpcom-plan-selector__price is-placeholder"></div>
					) }

					{ isLicenseCountsReady && (
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
					) }

					<div className="wpcom-plan-selector__cta">
						<div className="wpcom-plan-selector__cta-label">
							{ translate( 'How many sites would you like to buy?' ) }
						</div>

						<Button
							variant="primary"
							onClick={ () => onSelect( plan, quantity ) }
							disabled={ ! isLicenseCountsReady }
						>
							{ ctaLabel }
						</Button>
					</div>
				</div>

				<div className="wpcom-plan-selector__features">
					{ !! features1.length && <SimpleList items={ features1 } /> }
					{ !! features2.length && <SimpleList items={ features2 } /> }
				</div>
			</div>
		</div>
	);
}
