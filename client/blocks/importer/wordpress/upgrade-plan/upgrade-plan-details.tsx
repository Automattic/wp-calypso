import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { CloudLogo, Button, PlanPrice } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';

interface Props {
	site: SiteDetails;
	children: React.ReactNode;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );

	const { children, site } = props;
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );
	const plan = getPlan( selectedPlan );
	const sitePlans = useSitePlans( { siteId: site.ID } );
	const pricing = sitePlans?.data ? sitePlans?.data[ selectedPlan ].pricing : undefined;

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	return (
		<div className="import__upgrade-plan-details">
			<div className="import__upgrade-plan-period-switcher">
				<ButtonGroup>
					<Button
						borderless
						className={ clsx( { selected: selectedPlan === PLAN_BUSINESS_MONTHLY } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
					>
						{ __( 'Pay monthly' ) }
					</Button>
					<Button
						borderless
						className={ clsx( { selected: selectedPlan === PLAN_BUSINESS } ) }
						onClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
					>
						{ __( 'Pay annually' ) }
					</Button>
				</ButtonGroup>
			</div>

			<div className="import__upgrade-plan-container">
				<div className="import__upgrade-plan-features-container">
					<div className="import__upgrade-plan-header">
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

					<div className="import__upgrade-plan-price">
						<PlanPrice
							rawPrice={ pricing?.originalPrice.monthly ?? undefined }
							currencyCode={ pricing?.currencyCode }
							isSmallestUnit
						/>
						<span className="plan-time-frame">
							<small>{ plan?.getBillingTimeFrame() }</small>
						</span>
					</div>

					<div>
						<div className="import__upgrade-plan-cta">{ children }</div>
						<div className="import__upgrade-plan-refund-sub-text">
							{ __( 'Refundable within 14 days. No questions asked.' ) }
						</div>
					</div>

					<div className="import__upgrade-plan-features-list">
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
