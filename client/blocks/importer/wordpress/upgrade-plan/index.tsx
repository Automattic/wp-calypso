import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import UpgradePlanDetails from './upgrade-plan-details';

import './style.scss';

interface Props {
	site: SiteDetails;
	isBusy: boolean;
	ctaText: string;
	subTitleText?: string;
	hideTitleAndSubTitle?: boolean;
	onFreeTrialClick?: () => void;
	navigateToVerifyEmailStep: () => void;
	onCtaClick: () => void;
	onContentOnlyClick?: () => void;
	trackingEventsProps?: Record< string, unknown >;
	hideFreeMigrationTrialForNonVerifiedEmail?: boolean;
}

export const UpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const plan = getPlan( PLAN_BUSINESS );
	const fromUrl = useQuery().get( 'from' ) || '';
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
	} = props;
	const { data: migrationTrialEligibility } = useCheckEligibilityMigrationTrialPlan( site.ID );
	const isEligibleForTrialPlan =
		migrationTrialEligibility?.eligible ||
		// If the user's email is unverified, we still want to show the trial plan option
		migrationTrialEligibility?.error_code === 'email-unverified';

	const hideFreeMigrationTrial =
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
			from: fromUrl,
			has_source_site: fromUrl !== '',
			migration_trial_hidden: hideFreeMigrationTrial ? 'true' : 'false',
		};

		recordTracksEvent( 'calypso_site_migration_upgrade_plan_screen', allEventProps );
	}, [ migrationTrialEligibility, hideFreeMigrationTrial ] );

	const renderCTAs = () => {
		const cta = ctaText === '' ? translate( 'Continue' ) : ctaText;
		const trialText = translate( 'Try 7 days for free' );

		if ( hideFreeMigrationTrial ) {
			return (
				<NextButton isBusy={ isBusy } onClick={ onCtaClick }>
					{ cta }
				</NextButton>
			);
		}

		if ( isEligibleForTrialPlan ) {
			return (
				<>
					<NextButton onClick={ onFreeTrialClick }>{ trialText }</NextButton>
					<Button busy={ isBusy } transparent onClick={ onCtaClick }>
						{ cta }
					</Button>
				</>
			);
		}

		return (
			<>
				<NextButton isBusy={ isBusy } onClick={ onCtaClick }>
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
							? translate(
									'Migrations are exclusive to the Creator plan. Check out all its benefits, and upgrade to get started.'
							  )
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

			<UpgradePlanDetails>{ renderCTAs() }</UpgradePlanDetails>
		</div>
	);
};
