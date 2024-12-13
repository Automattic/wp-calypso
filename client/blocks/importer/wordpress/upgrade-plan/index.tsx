import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { useHasEnTranslation, useIsEnglishLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { Icon, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import PlanNoticeCreditUpgrade from 'calypso/my-sites/plans-features-main/components/plan-notice-credit-update';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useUpgradePlanHostingDetailsList } from './hooks/use-get-upgrade-plan-hosting-details-list';
import { Skeleton } from './skeleton';
import { VariantsSkeleton } from './skeleton/variants-skeleton';
import UpgradePlanDetails from './upgrade-plan-details';
import './style.scss';
import withMigrationSticker from './with-migration-sticker';
import type { UpgradePlanProps } from './types';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PricingMetaForGridPlan } from '@automattic/data-stores';

export const UnwrappedUpgradePlan: React.FunctionComponent< UpgradePlanProps > = ( props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const hasEnTranslation = useHasEnTranslation();
	const {
		site,
		navigateToVerifyEmailStep,
		onContentOnlyClick,
		ctaText,
		subTitleText,
		hideTitleAndSubTitle = false,
		onCtaClick,
		onFreeTrialClick: handleFreeTrialClick,
		isBusy,
		trackingEventsProps,
		hideFreeMigrationTrialForNonVerifiedEmail = false,
		visiblePlan = PLAN_BUSINESS,
		showVariants = false,
	} = props;
	const { data: migrationTrialEligibility } = useCheckEligibilityMigrationTrialPlan( site.ID );
	const isEligibleForTrialPlan =
		migrationTrialEligibility?.eligible ||
		// If the user's email is unverified, we still want to show the trial plan option
		migrationTrialEligibility?.error_code === 'email-unverified';

	const { list: upgradePlanHostingDetailsList, isFetching: isFetchingHostingDetails } =
		useUpgradePlanHostingDetailsList();
	const plan = getPlan( visiblePlan );

	const planMonthly = PLAN_BUSINESS_MONTHLY;
	const planBiennial = PLAN_BUSINESS_2_YEARS;

	const planSlugs: PlanSlug[] = [ visiblePlan, planMonthly, planBiennial ];

	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: planSlugs,
		siteId: site.ID,
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} );
	const pricing = planSlugs.reduce(
		( acc, planSlug: string ) => {
			acc[ planSlug ] = pricingMeta?.[ planSlug ];
			return acc;
		},
		{} as Record< string, PricingMetaForGridPlan | undefined >
	);

	const introOfferAvailable =
		isEnabled( 'migration-flow/introductory-offer' ) &&
		pricing[ visiblePlan ]?.introOffer &&
		pricing[ visiblePlan ]?.introOffer.rawPrice &&
		! pricing[ visiblePlan ]?.introOffer.isOfferComplete &&
		pricing[ visiblePlan ]?.originalPrice &&
		pricing[ visiblePlan ]?.originalPrice.monthly &&
		pricing[ visiblePlan ]?.originalPrice.full &&
		pricing[ visiblePlan ]?.currencyCode;

	const hideFreeMigrationTrial =
		introOfferAvailable ||
		( hideFreeMigrationTrialForNonVerifiedEmail &&
			migrationTrialEligibility?.error_code === 'email-unverified' ) ||
		! isEnabled( 'plans/migration-trial' );

	const onFreeTrialClick = () => {
		if ( migrationTrialEligibility?.error_code === 'email-unverified' ) {
			navigateToVerifyEmailStep();
		} else {
			handleFreeTrialClick?.();
		}
	};

	useEffect( () => {
		// Wait for the eligibility to return before triggering the Tracks event
		if ( ! migrationTrialEligibility ) {
			return;
		}

		const allEventProps = {
			...trackingEventsProps,
			migration_trial_hidden: hideFreeMigrationTrial ? 'true' : 'false',
		};

		recordTracksEvent( 'calypso_site_migration_upgrade_plan_screen', allEventProps );
	}, [ migrationTrialEligibility, hideFreeMigrationTrial ] );

	const renderCTAs = () => {
		let cta = ctaText;
		if ( introOfferAvailable && hasEnTranslation( 'Get the plan and migrate' ) ) {
			cta = translate( 'Get the plan and migrate' );
		} else if ( cta === '' ) {
			cta = translate( 'Continue' );
		}
		const trialText = translate( 'Try 7 days for free' );

		if ( hideFreeMigrationTrial ) {
			return (
				<NextButton isBusy={ isBusy } onClick={ () => onCtaClick( visiblePlan ) }>
					{ cta }
				</NextButton>
			);
		}

		if ( isEligibleForTrialPlan ) {
			return (
				<>
					<NextButton onClick={ onFreeTrialClick }>{ trialText }</NextButton>
					<Button busy={ isBusy } transparent onClick={ () => onCtaClick( visiblePlan ) }>
						{ cta }
					</Button>
				</>
			);
		}

		return (
			<>
				<NextButton isBusy={ isBusy } onClick={ () => onCtaClick( visiblePlan ) }>
					{ cta }
				</NextButton>
				<Button disabled transparent>
					{ trialText }
				</Button>
				<small>
					{ translate(
						'Free trials are a one-time offer and you’ve already enrolled in one in the past.'
					) }
				</small>
			</>
		);
	};

	const upgradeCtaCopy = hasEnTranslation(
		'Migrations are exclusive to the %(planName)s plan. Check out all its benefits, and upgrade to get started.'
	)
		? // translators: %(planName)s is a plan name. E.g. Commerce plan.
		  translate(
				'Migrations are exclusive to the %(planName)s plan. Check out all its benefits, and upgrade to get started.',
				{
					args: {
						planName: plan?.getTitle() ?? '',
					},
				}
		  )
		: translate(
				'Migrations are exclusive to the Creator plan. Check out all its benefits, and upgrade to get started.'
		  );

	if ( isFetchingHostingDetails || ! pricing[ visiblePlan ] ) {
		if ( ! showVariants ) {
			return <Skeleton />;
		}
		return <VariantsSkeleton />;
	}

	return (
		<div className="import__upgrade-plan">
			{ ! hideTitleAndSubTitle && (
				<div className="import__heading import__heading-center">
					<Title>
						{ isEnglishLocale
							? translate( 'Take your site to the next level' )
							: translate( 'Upgrade your plan' ) }
					</Title>
					<SubTitle className="onboarding-subtitle--full-width">
						{ subTitleText || isEnglishLocale
							? upgradeCtaCopy
							: translate(
									'Migrating themes, plugins, users, and settings requires a %(plan)s plan.',
									{
										args: {
											plan: plan?.getTitle() ?? '',
										},
									}
							  ) }
						<br />
						{ ! isEligibleForTrialPlan &&
							onContentOnlyClick &&
							translate(
								'To just migrate the content, use the {{link}}free content-only import option{{/link}}.',
								{
									components: {
										link: <Button borderless onClick={ onContentOnlyClick } />,
									},
								}
							) }
					</SubTitle>
				</div>
			) }

			<PlanNoticeCreditUpgrade siteId={ site.ID } visiblePlans={ [ visiblePlan ] } />
			<UpgradePlanDetails
				planSlugs={ planSlugs }
				pricing={ pricing as { [ key: string ]: PricingMetaForGridPlan } }
				introOfferAvailable={ !! introOfferAvailable }
				upgradePlanHostingDetailsList={ upgradePlanHostingDetailsList }
				showVariants={ showVariants }
				onCtaClick={ onCtaClick }
			>
				{ renderCTAs() }
			</UpgradePlanDetails>
			{ showVariants && (
				<div className="import__upgrade-plan-refund-sub-text">
					<Icon icon={ reusableBlock } />
					{ translate( 'Fully refundable. No questions asked.' ) }
				</div>
			) }
		</div>
	);
};

export const UpgradePlan = withMigrationSticker( UnwrappedUpgradePlan );
