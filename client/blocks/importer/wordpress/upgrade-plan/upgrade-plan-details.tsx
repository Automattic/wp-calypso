import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	calculateMonthlyPriceForPlan,
	getPlan,
	Plan,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	isMonthly,
} from '@automattic/calypso-products';
import { Badge, CloudLogo, Button, PlanPrice } from '@automattic/components';
import { SitePlanPricing } from '@automattic/data-stores';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { formatCurrency } from '@automattic/format-currency';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';

interface SwitcherProps {
	selectedPlan: string;
	onMonthlyPlanClick: () => void;
	onAnnualPlanClick: () => void;
}

const UpgradePlanPeriodSwitcher = ( props: SwitcherProps ) => {
	const translate = useTranslate();

	if ( config.isEnabled( 'migration-flow/introductory-offer' ) ) {
		return null;
	}

	const { selectedPlan, onMonthlyPlanClick, onAnnualPlanClick } = props;

	return (
		<div className="import__upgrade-plan-period-switcher">
			<ButtonGroup>
				<Button
					borderless
					className={ clsx( { selected: selectedPlan === PLAN_BUSINESS_MONTHLY } ) }
					onClick={ onMonthlyPlanClick }
				>
					{ translate( 'Pay monthly' ) }
				</Button>
				<Button
					borderless
					className={ clsx( { selected: selectedPlan === PLAN_BUSINESS } ) }
					onClick={ onAnnualPlanClick }
				>
					{ translate( 'Pay annually' ) }
				</Button>
			</ButtonGroup>
		</div>
	);
};

interface PlanPriceOfferProps {
	plan?: Plan;
	currencyCode?: string;
	originalMonthlyPrice?: number;
	introOfferMonthlyPrice?: number;
	originalFullPrice?: number;
	introOfferFullPrice?: number;
	introOfferEnabled: boolean;
	isIntroOfferComplete: boolean;
}

const PlanPriceOffer = ( props: PlanPriceOfferProps ) => {
	const translate = useTranslate();

	const {
		plan,
		originalFullPrice,
		introOfferFullPrice,
		introOfferEnabled,
		isIntroOfferComplete,
		introOfferMonthlyPrice,
		originalMonthlyPrice,
		currencyCode,
	} = props;

	const showIntroOffer =
		introOfferEnabled &&
		! isIntroOfferComplete &&
		introOfferMonthlyPrice &&
		originalMonthlyPrice &&
		introOfferFullPrice &&
		originalFullPrice &&
		currencyCode;

	if ( ! showIntroOffer ) {
		return (
			<div className="import__upgrade-plan-price">
				<PlanPrice rawPrice={ originalMonthlyPrice } currencyCode={ currencyCode } isSmallestUnit />
				<span className="plan-time-frame">
					<small>{ plan?.getBillingTimeFrame() }</small>
				</span>
			</div>
		);
	}

	const billingTimeFrame = translate(
		'per month, %(discountedPrice)s billed annually for the first year, %(originalPrice)s per year afterwards, excl. taxes',
		{
			args: {
				discountedPrice: formatCurrency( introOfferFullPrice, currencyCode, { stripZeros: true } ),
				originalPrice: formatCurrency( originalFullPrice, currencyCode, {
					isSmallestUnit: true,
					stripZeros: true,
				} ),
			},
			comment:
				'excl. taxes stands for excluding taxes; discountedPrice is a formatted price like $150; originalPrice is a formatted price like $200',
		}
	);

	return (
		<div className="import__upgrade-plan-price">
			<Badge type="info-purple" className="import__upgrade-plan-price-badge">
				{ translate( 'One time offer' ) }
			</Badge>
			<div className="import__upgrade-plan-price-group">
				<PlanPrice
					rawPrice={ originalMonthlyPrice }
					currencyCode={ currencyCode }
					original
					isSmallestUnit
				/>
				<PlanPrice rawPrice={ introOfferMonthlyPrice } currencyCode={ currencyCode } />
			</div>
			<span className="plan-time-frame">
				<small>{ billingTimeFrame }</small>
			</span>
		</div>
	);
};

const preparePlanPriceOfferProps = (
	selectedPlan: string,
	plan?: Plan,
	pricing?: SitePlanPricing
): PlanPriceOfferProps => {
	const currencyCode = pricing?.currencyCode;
	const originalMonthlyPrice = pricing?.originalPrice.monthly || undefined;

	const introOfferFullPrice = pricing?.introOffer?.rawPrice || undefined;
	const introOfferMonthlyPrice = introOfferFullPrice
		? calculateMonthlyPriceForPlan( selectedPlan, introOfferFullPrice )
		: undefined;

	const originalFullPrice = pricing?.originalPrice.full || undefined;	

	const introOfferEnabled = config.isEnabled( 'migration-flow/introductory-offer' );
	const isIntroOfferComplete = pricing?.introOffer?.isOfferComplete || false;

	return {
		plan,
		currencyCode,
		originalMonthlyPrice,
		introOfferMonthlyPrice,
		originalFullPrice,
		introOfferFullPrice,
		introOfferEnabled,
		isIntroOfferComplete,
	};
};

interface Props {
	siteId: number;
	children: React.ReactNode;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );

	const { children, siteId } = props;

	const plan = getPlan( selectedPlan );

	const plans = useSitePlans( { siteId } );
	const pricing = plans.data ? plans.data[ selectedPlan ].pricing : undefined;

	const planPriceOfferProps = preparePlanPriceOfferProps( selectedPlan, plan, pricing );

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	return (
		<div className="import__upgrade-plan-details">
			<UpgradePlanPeriodSwitcher
				selectedPlan={ selectedPlan }
				onMonthlyPlanClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
				onAnnualPlanClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
			/>

			<div className="import__upgrade-plan-container">
				<div className="import__upgrade-plan-features-container">
					<div className="import__upgrade-plan-header">
						<Plans2023Tooltip
							text={ translate(
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
						<p>{ translate( 'Unlock the power of WordPress with plugins and cloud tools.' ) }</p>
					</div>

					<PlanPriceOffer { ...planPriceOfferProps } />

					<div>
						<div className="import__upgrade-plan-cta">{ children }</div>
						<div className="import__upgrade-plan-refund-sub-text">
							{ plan && ! isMonthly( plan.getStoreSlug() )
								? translate( 'Refundable within 14 days. No questions asked.' )
								: translate( 'Refundable within 7 days. No questions asked.' ) }
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
