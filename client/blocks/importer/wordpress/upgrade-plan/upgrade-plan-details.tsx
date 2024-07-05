import { recordTracksEvent } from '@automattic/calypso-analytics';
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
import { formatCurrency } from '@automattic/format-currency';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, type PropsWithChildren } from 'react';
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

interface UpgradePlanPriceProps {
	billingTimeFrame: TranslateResult | undefined;
}

const UpgradePlanPrice = ( props: PropsWithChildren< UpgradePlanPriceProps > ) => {
	const { billingTimeFrame, children } = props;
	return (
		<div className="import__upgrade-plan-price">
			{ ' ' }
			{ children }{ ' ' }
			<span className="plan-time-frame">
				{ ' ' }
				<small>{ billingTimeFrame ?? '' }</small>{ ' ' }
			</span>{ ' ' }
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
	introOfferAvailable: boolean;
}

const PlanPriceOffer = ( props: PlanPriceOfferProps ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const {
		plan,
		originalFullPrice,
		introOfferFullPrice,
		introOfferAvailable,
		introOfferMonthlyPrice,
		originalMonthlyPrice,
		currencyCode,
	} = props;

	const showOriginalPrice =
		! introOfferAvailable || ! introOfferFullPrice || ! originalFullPrice || ! currencyCode;

	if ( showOriginalPrice ) {
		return (
			<UpgradePlanPrice billingTimeFrame={ plan?.getBillingTimeFrame() }>
				<PlanPrice rawPrice={ originalMonthlyPrice } currencyCode={ currencyCode } isSmallestUnit />
			</UpgradePlanPrice>
		);
	}

	const billingTimeFrame = hasEnTranslation(
		'per month, %(discountedPrice)s billed annually for the first year, %(originalPrice)s per year afterwards, excl. taxes'
	)
		? translate(
				'per month, %(discountedPrice)s billed annually for the first year, %(originalPrice)s per year afterwards, excl. taxes',
				{
					args: {
						discountedPrice: formatCurrency( introOfferFullPrice, currencyCode, {
							stripZeros: true,
						} ),
						originalPrice: formatCurrency( originalFullPrice, currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
					comment:
						'excl. taxes stands for excluding taxes; discountedPrice is a formatted price like $150; originalPrice is a formatted price like $200',
				}
		  )
		: translate(
				'per month, for your first %(introOfferIntervalUnit)s,{{br/}}' +
					'then %(rawPrice)s billed annually, excl. taxes',
				{
					args: {
						rawPrice: formatCurrency( originalFullPrice, currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						introOfferIntervalUnit: translate( 'year' ),
					},
					components: { br: <br /> },
					comment: 'excl. taxes is short for excluding taxes',
				}
		  );

	const badgeText = hasEnTranslation( 'One time offer' )
		? translate( 'One time offer' )
		: translate( 'One time discount' );

	return (
		<UpgradePlanPrice billingTimeFrame={ billingTimeFrame }>
			<Badge type="info-purple" className="import__upgrade-plan-price-badge">
				{ badgeText }
			</Badge>
			<div className="import__upgrade-plan-price-group">
				<PlanPrice
					rawPrice={ originalMonthlyPrice }
					currencyCode={ currencyCode }
					original
					isSmallestUnit
				/>
				<PlanPrice
					className="improt__upgrade-plan-price-discounted"
					rawPrice={ introOfferMonthlyPrice }
					currencyCode={ currencyCode }
				/>
			</div>
		</UpgradePlanPrice>
	);
};

const preparePlanPriceOfferProps = (
	selectedPlan: string,
	introOfferAvailable: boolean,
	plan?: Plan,
	pricing?: SitePlanPricing
): PlanPriceOfferProps => {
	const currencyCode = pricing?.currencyCode;
	const originalMonthlyPrice = pricing?.originalPrice.monthly ?? undefined;

	const introOfferFullPrice = pricing?.introOffer?.rawPrice ?? undefined;
	const introOfferMonthlyPrice = introOfferFullPrice
		? calculateMonthlyPriceForPlan( selectedPlan, introOfferFullPrice )
		: undefined;

	const originalFullPrice = pricing?.originalPrice.full ?? undefined;

	return {
		plan,
		currencyCode,
		originalMonthlyPrice,
		introOfferMonthlyPrice,
		originalFullPrice,
		introOfferFullPrice,
		introOfferAvailable,
	};
};

interface Props {
	children: React.ReactNode;
	introOfferAvailable: boolean;
	pricing?: SitePlanPricing;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );

	const { children, pricing, introOfferAvailable } = props;

	const plan = getPlan( selectedPlan );

	const planPriceOfferProps = preparePlanPriceOfferProps(
		selectedPlan,
		introOfferAvailable,
		plan,
		pricing
	);

	const { mutate: setSelectedPlanSlug } = useSelectedPlanUpgradeMutation();

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	useEffect( () => {
		plan && plan.getPathSlug && setSelectedPlanSlug( plan.getPathSlug() );
	}, [ plan ] );

	return (
		<div className="import__upgrade-plan-details">
			{ ! introOfferAvailable && (
				<UpgradePlanPeriodSwitcher
					selectedPlan={ selectedPlan }
					onMonthlyPlanClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
					onAnnualPlanClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
				/>
			) }

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
