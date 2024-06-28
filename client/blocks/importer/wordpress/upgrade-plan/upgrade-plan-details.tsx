import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { CloudLogo, Button, PlanPrice } from '@automattic/components';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import QueryPlans from 'calypso/components/data/query-plans';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { useUpgradePlanHostingDetailsList } from './hooks/use-get-upgrade-plan-hosting-details-list';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';
import UpgradePlanLoader from './upgrade-plan-loader';

interface Props {
	children: React.ReactNode;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );

	const { children } = props;
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );
	const plan = getPlan( selectedPlan );
	const planId = plan?.getProductId();

	const { list: upgradePlanHostingDetailsList, isFetching: isFetchingHostingDetails } =
		useUpgradePlanHostingDetailsList();

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planId as number, true ) );

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	if ( isFetchingHostingDetails || ! rawPrice || ! currencyCode ) {
		return <UpgradePlanLoader />;
	}

	return (
		<div className="import__upgrade-plan-details">
			<QueryPlans />

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
						<PlanPrice rawPrice={ rawPrice ?? undefined } currencyCode={ currencyCode } />
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
				<UpgradePlanHostingDetails
					upgradePlanHostingDetailsList={ upgradePlanHostingDetailsList }
				/>
			</div>
		</div>
	);
};

// TODO: Refactor splitting parts.
const UpgradePlanDetailsWrapper = ( props: Props ) => {
	const siteId = Number( useSiteIdParam() ) ?? 0;

	const { addMigrationSticker, isPending } = useMigrationStickerMutation();

	// It uses the layout effect to avoid the screen flickering because isPending starts as `true` and changes only after this effect.
	useLayoutEffect( () => {
		if ( ! config.isEnabled( 'migration-flow/introductory-offer' ) ) {
			return;
		}

		if ( 0 !== siteId ) {
			addMigrationSticker( siteId );
		}
	}, [ addMigrationSticker, siteId ] );

	if ( isPending ) {
		return <UpgradePlanLoader />;
	}

	return (
		<div>
			<QueryPlans />
			<UpgradePlanDetails { ...props } />
		</div>
	);
};

export default UpgradePlanDetailsWrapper;
