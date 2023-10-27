import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { CloudLogo, Button } from '@automattic/components';
import { Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import QueryPlans from 'calypso/components/data/query-plans';
import PlanPrice from 'calypso/my-sites/plan-price';
import { Plans2023Tooltip } from 'calypso/my-sites/plans-grid/components/plans-2023-tooltip';
import { useManageTooltipToggle } from 'calypso/my-sites/plans-grid/hooks/use-manage-tooltip-toggle';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';

interface Props {
	children: React.ReactNode;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();

	const { children } = props;
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS_MONTHLY );
	const plan = getPlan( selectedPlan );
	const planId = plan?.getProductId();

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planId as number, true ) );

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	return (
		<div className={ classnames( 'import__upgrade-plan' ) }>
			<QueryPlans />

			<div className={ classnames( 'import__upgrade-plan-period-switcher' ) }>
				<ButtonGroup>
					<Button
						borderless={ true }
						className={ classnames( { selected: selectedPlan === PLAN_BUSINESS_MONTHLY } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
					>
						{ __( 'Pay monthly' ) }
					</Button>
					<Button
						borderless={ true }
						className={ classnames( { selected: selectedPlan === PLAN_BUSINESS } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
					>
						{ __( 'Pay annually' ) }
					</Button>
				</ButtonGroup>
			</div>

			<div className={ classnames( 'import__upgrade-plan-container' ) }>
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
					<small>{ __( 'Unlock the power of WordPress with plugins and cloud tools.' ) }</small>
				</div>

				<div className={ classnames( 'import__upgrade-plan-price' ) }>
					<PlanPrice rawPrice={ rawPrice ?? undefined } currencyCode={ currencyCode } />
					<span className={ classnames( 'plan-time-frame' ) }>
						<small>{ plan?.getBillingTimeFrame() }</small>
						<small>{ __( 'Refundable within 14 days. No questions asked.' ) }</small>
					</span>
				</div>

				<div className={ classnames( 'import__upgrade-plan-cta' ) }>{ children }</div>

				<div className={ classnames( 'import__upgrade-plan-details' ) }>
					<UpgradePlanFeatureList plan={ plan } />
				</div>
			</div>
		</div>
	);
};

export default UpgradePlanDetails;
