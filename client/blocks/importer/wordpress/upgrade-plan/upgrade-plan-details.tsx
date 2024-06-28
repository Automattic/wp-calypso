import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan, Plan, PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { CloudLogo, Button, PlanPrice } from '@automattic/components';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { useSelector } from 'calypso/state';
import { getSitePlan, getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';

interface Props {
	siteId: number;
	children: React.ReactNode;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );

	const { children, siteId } = props;

	const plan = getPlan( selectedPlan );
	const planDetails = useSelector( ( state ) =>
		siteId ? getSitePlan( state, siteId, selectedPlan ) : null
	);

	const rawPrice = useSelector( ( state ) =>
		getSitePlanRawPrice( state, siteId, selectedPlan, { returnMonthly: true } )
	);

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	const introOfferEnabled = config.isEnabled( 'migration-flow/introductory-offer' );

	const onMonthlyPlanClick = () => setSelectedPlan( PLAN_BUSINESS_MONTHLY );
	const onAnnualPlanClick = () => setSelectedPlan( PLAN_BUSINESS );

	return (
		<div className="import__upgrade-plan-details">
			<QuerySitePlans siteId={ siteId } />

			{ renderUpgradePlanPeriodSwitcher(
				introOfferEnabled,
				selectedPlan,
				onMonthlyPlanClick,
				onAnnualPlanClick,
				__
			) }

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

					{ renderPlanPrice( introOfferEnabled, rawPrice, plan, planDetails ) }

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

function renderUpgradePlanPeriodSwitcher(
	introOfferEnabled: boolean,
	selectedPlan: string,
	onMonthlyPlanClick: () => void,
	onAnnualPlanClick: () => void,
	__: ( s: string ) => string
) {
	if ( introOfferEnabled ) {
		return null;
	}

	return (
		<div className="import__upgrade-plan-period-switcher">
			<ButtonGroup>
				<Button
					borderless
					className={ clsx( { selected: selectedPlan === PLAN_BUSINESS_MONTHLY } ) }
					onClick={ onMonthlyPlanClick }
				>
					{ __( 'Pay monthly' ) }
				</Button>
				<Button
					borderless
					className={ clsx( { selected: selectedPlan === PLAN_BUSINESS } ) }
					onClick={ onAnnualPlanClick }
				>
					{ __( 'Pay annually' ) }
				</Button>
			</ButtonGroup>
		</div>
	);
}

function renderPlanPrice(
	introOfferEnabled: boolean,
	rawPrice?: number,
	plan?: Plan,
	planDetails?: SitePlanData
) {
	// for tests
	planDetails = {
		...planDetails,
		introductoryOfferRawPrice: 150,
		currencyCode: 'USD',
	};

	let price = <PlanPrice rawPrice={ rawPrice } currencyCode={ planDetails?.currencyCode } />;
	if ( introOfferEnabled ) {
		if ( planDetails?.introductoryOfferRawPrice ) {
			price = (
				<div>
					<PlanPrice
						rawPrice={ planDetails?.introductoryOfferRawPrice }
						currencyCode={ planDetails?.currencyCode }
					/>
					<PlanPrice rawPrice={ rawPrice } currencyCode={ planDetails?.currencyCode } original />
				</div>
			);
		}
	}

	// need adjust the billing time frame for intro
	return (
		<div className="import__upgrade-plan-price">
			{ price }
			<span className="plan-time-frame">
				<small>{ plan?.getBillingTimeFrame() }</small>
			</span>
		</div>
	);
}

export default UpgradePlanDetails;
