import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { getProductPricingInfo } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useSelector } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';
import getPressablePlan from './lib/get-pressable-plan';
import getPressableShortName from './lib/get-pressable-short-name';

type Props = {
	selectedPlan: APIProductFamilyProduct | null;
	onSelectPlan: () => void;
};

function IncludedList( { items }: { items: ReactNode[] } ) {
	return (
		<ul className="pressable-overview__plan-details-card-included-list">
			{ items.map( ( item, index ) => (
				<li key={ `included-item-${ index }` }>
					<Icon
						className="pressable-overview__plan-details-card-included-list-icon"
						icon={ check }
						size={ 24 }
					/>
					{ item }
				</li>
			) ) }
		</ul>
	);
}

export default function PressableOverviewPlanDetails( { selectedPlan, onSelectPlan }: Props ) {
	const translate = useTranslate();

	const info = selectedPlan?.slug ? getPressablePlan( selectedPlan?.slug ) : null;

	const customString = translate( 'Custom' );

	const userProducts = useSelector( getProductsList );

	const { discountedCost } = selectedPlan
		? getProductPricingInfo( userProducts, selectedPlan, 1 )
		: { discountedCost: 0 };

	return (
		<section className="pressable-overview__plan-details">
			<div className="pressable-overview__plan-details-card">
				<div className="pressable-overview__plan-details-card-header">
					<h3 className="pressable-overview__plan-details-card-header-title">
						{ translate( '%(planName)s plan', {
							args: {
								planName: selectedPlan ? getPressableShortName( selectedPlan.name ) : customString,
							},
						} ) }
					</h3>

					{ selectedPlan && (
						<div className="pressable-overview__plan-details-card-header-price">
							<strong className="pressable-overview__plan-details-card-header-price-value">
								{ formatCurrency( discountedCost, selectedPlan.currency ) }
							</strong>
							<span className="pressable-overview__plan-details-card-header-price-interval">
								{ selectedPlan.price_interval === 'day' && translate( 'per plan per day' ) }
								{ selectedPlan.price_interval === 'month' && translate( 'per plan per month' ) }
							</span>
						</div>
					) }
				</div>

				<IncludedList
					items={ [
						translate( '{{b}}%(count)s{{/b}} WordPress installs', {
							args: {
								count: info?.install ?? customString,
							},
							components: { b: <b /> },
						} ),
						translate( '{{b}}%(count)s{{/b}} visits per month', {
							args: {
								count: info?.visits ?? customString,
							},
							components: { b: <b /> },
						} ),
						translate( '{{b}}%(size)s{{/b}} storage per month', {
							args: {
								size: info ? `${ info.storage }GB` : customString,
							},
							components: { b: <b /> },
						} ),
					] }
				/>

				<Button
					className="pressable-overview__plan-details-card-cta-button"
					onClick={ onSelectPlan }
					variant="primary"
				>
					{ translate( 'Select %(planName)s plan', {
						args: {
							planName: selectedPlan ? getPressableShortName( selectedPlan.name ) : customString,
						},
					} ) }
				</Button>
			</div>

			<div className="pressable-overview__plan-details-card is-aside">
				<h3 className="pressable-overview__plan-details-card-header-title">
					{ translate( 'All plans include:' ) }{ ' ' }
				</h3>

				<IncludedList
					items={ [
						translate( '24/7 WordPress hosting support' ),
						translate( 'WP Cloud platform' ),
						translate( 'Jetpack Security (optional)' ),
						translate( 'Free sites migration' ),
					] }
				/>
			</div>
		</section>
	);
}
