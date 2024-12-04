import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	getPlan,
	Plan,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	isMonthly,
} from '@automattic/calypso-products';
import { Badge, CloudLogo, Button, PlanPrice } from '@automattic/components';
import { PricingMetaForGridPlan } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { NextButton, Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import { useState, useEffect, type PropsWithChildren } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { UpgradePlanDetailsProps } from './types';
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
	showVariants?: boolean;
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
		showVariants,
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
							isSmallestUnit: true,
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

	const badgeText = hasEnTranslation( '50% off your first year' )
		? translate( '50% off your first year' )
		: translate( 'One time offer' );

	return (
		<UpgradePlanPrice billingTimeFrame={ billingTimeFrame }>
			{ ! showVariants && (
				<Badge type="info-purple" className="import__upgrade-plan-price-badge">
					{ badgeText }
				</Badge>
			) }
			<div className="import__upgrade-plan-price-group">
				<PlanPrice
					rawPrice={ originalMonthlyPrice }
					currencyCode={ currencyCode }
					original
					isSmallestUnit
				/>
				<PlanPrice
					className="import__upgrade-plan-price-discounted"
					rawPrice={ introOfferMonthlyPrice }
					currencyCode={ currencyCode }
					isSmallestUnit
				/>
			</div>
		</UpgradePlanPrice>
	);
};

const preparePlanPriceOfferProps = (
	introOfferAvailable: boolean,
	plan?: Plan,
	pricing?: PricingMetaForGridPlan,
	showVariants?: boolean
): PlanPriceOfferProps => {
	const currencyCode = pricing?.currencyCode;
	const originalMonthlyPrice = pricing?.originalPrice.monthly ?? undefined;

	const introOfferFullPrice = pricing?.introOffer?.rawPrice.full ?? undefined;
	const introOfferMonthlyPrice = pricing?.introOffer?.rawPrice.monthly ?? undefined;

	const originalFullPrice = pricing?.originalPrice.full ?? undefined;

	return {
		plan,
		currencyCode,
		originalMonthlyPrice,
		introOfferMonthlyPrice,
		originalFullPrice,
		introOfferFullPrice,
		introOfferAvailable,
		showVariants,
	};
};

export const UpgradePlanDetails = ( props: UpgradePlanDetailsProps ) => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ showFeatures, setShowFeatures ] = useState( false );
	const [ selectedPlan, setSelectedPlan ] = useState<
		typeof PLAN_BUSINESS | typeof PLAN_BUSINESS_MONTHLY
	>( PLAN_BUSINESS );

	const {
		children,
		pricing,
		pricing2Years,
		pricingMonthly,
		introOfferAvailable,
		upgradePlanHostingDetailsList,
		showVariants,
		onCtaClick,
	} = props;

	const plan = getPlan( selectedPlan );
	const planMonthly = getPlan( PLAN_BUSINESS_MONTHLY );
	const plan2Years = getPlan( PLAN_BUSINESS_2_YEARS );

	const planPriceOfferProps = preparePlanPriceOfferProps(
		introOfferAvailable,
		plan,
		pricing,
		showVariants
	);
	const planPriceOfferPropsMonthly = preparePlanPriceOfferProps(
		introOfferAvailable,
		planMonthly,
		pricingMonthly,
		showVariants
	);
	const planPriceOfferProps2Years = preparePlanPriceOfferProps(
		introOfferAvailable,
		plan2Years,
		pricing2Years,
		showVariants
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
			{ ! introOfferAvailable && ! showVariants && (
				<UpgradePlanPeriodSwitcher
					selectedPlan={ selectedPlan }
					onMonthlyPlanClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
					onAnnualPlanClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
				/>
			) }

			{ showVariants && (
				<div className="import__upgrade-plan-container">
					<div className="import__upgrade-plan-features-container">
						<div className="import__upgrade-plan-header">
							<Title className="plan-title" tagName="h2">
								{ translate( 'Monthly' ) }
							</Title>
						</div>

						<PlanPriceOffer { ...planPriceOfferPropsMonthly } />

						<div>
							<div className="import__upgrade-plan-cta">
								<NextButton
									variant="secondary"
									onClick={ () => onCtaClick?.( PLAN_BUSINESS_MONTHLY ) }
								>
									{ translate( 'Get Monthly' ) }
								</NextButton>
							</div>
							<div className="import__upgrade-plan-refund-sub-text">
								{ translate( 'Refundable within 7 days. No questions asked.' ) }
							</div>
						</div>
						<div className="import__upgrade-plan-features-list">
							<UpgradePlanFeatureList
								plan={ planMonthly }
								showFeatures={ showFeatures }
								setShowFeatures={ setShowFeatures }
							/>
						</div>
					</div>
				</div>
			) }

			<div className="import__upgrade-plan-container">
				<div className="import__upgrade-plan-features-container">
					<div className="import__upgrade-plan-header">
						{ showVariants ? (
							<Badge className="import__upgrade-plan-variants-badge">
								{ translate( 'Most popular' ) }
							</Badge>
						) : (
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
						) }
						<Title className="plan-title" tagName="h2">
							{ showVariants ? translate( 'Yearly' ) : plan?.getTitle() }
						</Title>
						{ ! showVariants && (
							<p>{ translate( 'Unlock the power of WordPress with plugins and cloud tools.' ) }</p>
						) }
					</div>

					<PlanPriceOffer { ...planPriceOfferProps } />

					<div>
						<div className="import__upgrade-plan-cta">
							{ showVariants ? (
								<NextButton onClick={ () => onCtaClick?.( PLAN_BUSINESS ) }>
									{ translate( 'Get Yearly' ) }
								</NextButton>
							) : (
								children
							) }
						</div>
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
				{ ! showVariants && (
					<UpgradePlanHostingDetails
						upgradePlanHostingDetailsList={ upgradePlanHostingDetailsList }
					/>
				) }
			</div>

			{ showVariants && (
				<div className="import__upgrade-plan-container">
					<div className="import__upgrade-plan-features-container">
						<div className="import__upgrade-plan-header">
							<Title className="plan-title" tagName="h2">
								{ translate( 'Biennially' ) }
							</Title>
						</div>

						<PlanPriceOffer { ...planPriceOfferProps2Years } />

						<div>
							<div className="import__upgrade-plan-cta">
								<NextButton
									variant="secondary"
									onClick={ () => onCtaClick?.( PLAN_BUSINESS_2_YEARS ) }
								>
									{ translate( 'Get Biennial' ) }
								</NextButton>
							</div>
							<div className="import__upgrade-plan-refund-sub-text">
								{ translate( 'Refundable within 14 days. No questions asked.' ) }
							</div>
						</div>
						<div className="import__upgrade-plan-features-list">
							<UpgradePlanFeatureList
								plan={ plan2Years }
								showFeatures={ showFeatures }
								setShowFeatures={ setShowFeatures }
							/>
						</div>
					</div>
				</div>
			) }
		</div>
	);
};

export default UpgradePlanDetails;
