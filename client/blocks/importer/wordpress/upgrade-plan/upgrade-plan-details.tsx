import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { CloudLogo, Button, PlanPrice } from '@automattic/components';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import QueryPlans from 'calypso/components/data/query-plans';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';

interface Props {
	children: React.ReactNode;
	isEligibleForTrialPlan: boolean;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );

	const { children, isEligibleForTrialPlan } = props;
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );
	const plan = getPlan( selectedPlan );
	const planId = plan?.getProductId();

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planId as number, true ) );

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	return (
		<div className={ classnames( 'import__upgrade-plan-details' ) }>
			<QueryPlans />

			<div className={ classnames( 'import__upgrade-plan-period-switcher' ) }>
				<ButtonGroup>
					<Button
						borderless
						className={ classnames( { selected: selectedPlan === PLAN_BUSINESS_MONTHLY } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
					>
						{ __( 'Pay monthly' ) }
					</Button>
					<Button
						borderless
						className={ classnames( { selected: selectedPlan === PLAN_BUSINESS } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
					>
						{ __( 'Pay annually' ) }
					</Button>
				</ButtonGroup>
			</div>

			<div
				className={ classnames( 'import__upgrade-plan-container', {
					'feature-list-expanded': showFeatures,
					'is-not-eligible-for-trial-plan': ! isEligibleForTrialPlan,
				} ) }
			>
				<div className={ classnames( 'import__upgrade-plan-features-container' ) }>
					<div className={ classnames( 'import__upgrade-plan-header' ) }>
						<Plans2023Tooltip
							text={ __(
								'WP Cloud gives you the tools you need to add scalable, highly available, extremely fast WordPress hosting.'
							) }
							id="wp-cloud-logo"
							setActiveTooltipId={ setActiveTooltipId }
							activeTooltipId={ activeTooltipId }
						>
							<CloudLogo />
						</Plans2023Tooltip>
						<Title className="plan-title" tagName="h2">
							{ plan?.getTitle() }
						</Title>
						<p>{ __( 'Unlock the power of WordPress with plugins and cloud tools.' ) }</p>
					</div>

					<div className={ classnames( 'import__upgrade-plan-price' ) }>
						<PlanPrice rawPrice={ rawPrice ?? undefined } currencyCode={ currencyCode } />
						<span className={ classnames( 'plan-time-frame' ) }>
							<small>{ plan?.getBillingTimeFrame() }</small>
							<small>{ __( 'Refundable within 14 days. No questions asked.' ) }</small>
						</span>
					</div>

					<div className={ classnames( 'import__upgrade-plan-cta' ) }>{ children }</div>

					<div className={ classnames( 'import__upgrade-plan-features-list' ) }>
						<UpgradePlanFeatureList
							plan={ plan }
							showFeatures={ showFeatures }
							setShowFeatures={ setShowFeatures }
						/>
					</div>
				</div>
				<UpgradePlanHostingDetails />
			</div>
		</div>
	);
};

export default UpgradePlanDetails;
