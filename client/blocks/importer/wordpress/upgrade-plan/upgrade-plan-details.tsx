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
import { CloudLogo, Button, PlanPrice } from '@automattic/components';
import { SitePlanPricing } from '@automattic/data-stores';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { Title } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { useSelectedPlanUpgradeMutation } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { useSelector } from 'calypso/state';
import { getSitePlan } from 'calypso/state/sites/plans/selectors';
import { UpgradePlanFeatureList } from './upgrade-plan-feature-list';
import { UpgradePlanHostingDetails } from './upgrade-plan-hosting-details';

interface SwitcherProps {
	selectedPlan: string;
	onMonthlyPlanClick: () => void;
	onAnnualPlanClick: () => void;
}

const UpgradePlanPeriodSwitcher = ( props: SwitcherProps ) => {
	const { __ } = useI18n();

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
};

const Badge = styled.div< { isForIntroOffer?: boolean; isHidden?: boolean } >`
	text-align: center;
	white-space: nowrap;
	font-size: 0.75rem;
	line-height: 1.25rem;
	border-radius: 4px;
	height: 21px;
	display: inline-block;
	width: fit-content;
	letter-spacing: 0.2px;
	font-weight: 500;
	text-align: center;
	padding: 0 12px;
	background-color: #e6d1ff;
	color: #350e63;
	text-transform: none;
`;

const PricesGroup = styled.div`
	justify-content: flex-end;
	display: flex;
	flex-direction: row-reverse;
	align-items: flex-end;
	gap: 4px;
`;

interface PriceWithIntroductoryOfferProps {
	originalMonthlyPrice: number;
	introOfferMonthlyPrice: number;
	currencyCode?: string;
}

const PriceWithIntroductoryOffer = ( props: PriceWithIntroductoryOfferProps ) => {
	const { originalMonthlyPrice, introOfferMonthlyPrice, currencyCode } = props;
	const translate = useTranslate();

	return (
		<>
			<Badge>{ translate( 'One time offer' ) }</Badge>
			<PricesGroup>
				<PlanPrice
					rawPrice={ originalMonthlyPrice }
					currencyCode={ currencyCode }
					original
					isSmallestUnit
				/>
				<PlanPrice rawPrice={ introOfferMonthlyPrice } currencyCode={ currencyCode } />
			</PricesGroup>
		</>
	);
};

interface PlanPriceOfferProps {
	plan?: Plan;
	currencyCode?: string;
	originalMonthlyPrice?: number;
	introOfferMonthlyPrice?: number;
	formattedOriginalPrice?: string;
	formattedIntroOfferPrice?: string;
	introOfferEnabled: boolean;
	isIntroOfferComplete: boolean;
}

const PlanPriceOffer = ( props: PlanPriceOfferProps ) => {
	const translate = useTranslate();

	const {
		plan,
		formattedOriginalPrice,
		formattedIntroOfferPrice,
		introOfferEnabled,
		isIntroOfferComplete,
		introOfferMonthlyPrice,
		originalMonthlyPrice,
		currencyCode,
	} = props;

	const showIntroOffer =
		introOfferEnabled && ! isIntroOfferComplete && introOfferMonthlyPrice && originalMonthlyPrice;

	const price = showIntroOffer ? (
		<PriceWithIntroductoryOffer
			originalMonthlyPrice={ originalMonthlyPrice }
			introOfferMonthlyPrice={ introOfferMonthlyPrice }
			currencyCode={ currencyCode }
		/>
	) : (
		<PlanPrice rawPrice={ originalMonthlyPrice } currencyCode={ currencyCode } isSmallestUnit />
	);

	if ( plan && showIntroOffer && formattedIntroOfferPrice ) {
		plan.getBillingTimeFrame = () =>
			translate(
				'per month, %(discounted)s billed annually for the first year, %(original)s atferwards',
				{
					args: {
						discounted: formattedIntroOfferPrice,
						original: formattedOriginalPrice || '',
					},
				}
			);
	}

	return (
		<div className="import__upgrade-plan-price">
			{ price }
			<span className="plan-time-frame">
				<small>{ plan?.getBillingTimeFrame() }</small>
			</span>
		</div>
	);
};

const preparePlanPriceOfferProps = (
	selectedPlan: string,
	plan?: Plan,
	pricing?: SitePlanPricing,
	planDetails?: SitePlanData
): PlanPriceOfferProps => {
	let formattedOriginalPrice = undefined;
	if ( planDetails && planDetails.formattedOriginalPrice ) {
		formattedOriginalPrice = planDetails.formattedOriginalPrice;
	}
	if ( ! formattedOriginalPrice ) {
		formattedOriginalPrice = planDetails?.formattedPrice || undefined;
	}

	const currencyCode = pricing?.currencyCode;
	const originalMonthlyPrice = pricing?.originalPrice.monthly || undefined;

	const introOfferRawPrice = pricing?.introOffer?.rawPrice;
	const introOfferMonthlyPrice = introOfferRawPrice
		? calculateMonthlyPriceForPlan( selectedPlan, introOfferRawPrice )
		: undefined;
	const formattedIntroOfferPrice = pricing?.introOffer?.formattedPrice || undefined;

	const introOfferEnabled = config.isEnabled( 'migration-flow/introductory-offer' );
	const isIntroOfferComplete = pricing?.introOffer?.isOfferComplete || false;

	return {
		plan,
		currencyCode,
		originalMonthlyPrice,
		introOfferMonthlyPrice,
		formattedOriginalPrice,
		formattedIntroOfferPrice,
		introOfferEnabled,
		isIntroOfferComplete,
	};
};

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

	const plans = useSitePlans( { siteId } );
	const pricing = plans.data ? plans.data[ selectedPlan ].pricing : undefined;

	const planDetails =
		useSelector( ( state ) => ( siteId ? getSitePlan( state, siteId, selectedPlan ) : null ) ) ||
		undefined;

	const planPriceOfferProps = preparePlanPriceOfferProps(
		selectedPlan,
		plan,
		pricing,
		planDetails
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
			<QuerySitePlans siteId={ siteId } />

			<UpgradePlanPeriodSwitcher
				selectedPlan={ selectedPlan }
				onMonthlyPlanClick={ () => setSelectedPlan( PLAN_BUSINESS_MONTHLY ) }
				onAnnualPlanClick={ () => setSelectedPlan( PLAN_BUSINESS ) }
			/>

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

					<PlanPriceOffer { ...planPriceOfferProps } />

					<div>
						<div className="import__upgrade-plan-cta">{ children }</div>
						<div className="import__upgrade-plan-refund-sub-text">
							{ plan && ! isMonthly( plan.getStoreSlug() )
								? __( 'Refundable within 14 days. No questions asked.' )
								: __( 'Refundable within 7 days. No questions asked.' ) }
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
