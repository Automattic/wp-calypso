import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import useAddHostingTrialMutation, {
	HOSTING_INTENT_MIGRATE,
} from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSite } from 'calypso/state/sites/actions';
import UpgradePlanDetails from './upgrade-plan-details';

import './style.scss';

interface Props {
	site: SiteDetails;
	isBusy: boolean;
	ctaText: string;
	subTitleText?: string;
	hideTitleAndSubTitle?: boolean;
	sendIntentWhenCreatingTrial?: boolean;
	onFreeTrialSelectionSuccess?: () => void;
	navigateToVerifyEmailStep: () => void;
	onCtaClick: () => void;
	onContentOnlyClick?: () => void;
	trackingEventsProps?: Record< string, unknown >;
}

export const UpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const plan = getPlan( PLAN_BUSINESS );
	const {
		site,
		navigateToVerifyEmailStep,
		onContentOnlyClick,
		ctaText,
		subTitleText,
		hideTitleAndSubTitle = false,
		sendIntentWhenCreatingTrial = false,
		onFreeTrialSelectionSuccess = () => {},
		onCtaClick,
		isBusy,
		trackingEventsProps,
	} = props;
	const { data: migrationTrialEligibility } = useCheckEligibilityMigrationTrialPlan( site.ID );
	const isEligibleForTrialPlan =
		migrationTrialEligibility?.eligible ||
		// If the user's email is unverified, we still want to show the trial plan option
		migrationTrialEligibility?.error_code === 'email-unverified';

	const { addHostingTrial, isPending: isAddingTrial } = useAddHostingTrialMutation( {
		onSuccess: () => {
			onFreeTrialSelectionSuccess?.();
			// After the trial is added, we need to request the site again to get the updated plan
			site && dispatch( requestSite( site.ID ) );
		},
	} );

	const onFreeTrialClick = () => {
		if ( migrationTrialEligibility?.error_code === 'email-unverified' ) {
			navigateToVerifyEmailStep();
		} else if ( sendIntentWhenCreatingTrial ) {
			addHostingTrial( site.ID, PLAN_MIGRATION_TRIAL_MONTHLY, HOSTING_INTENT_MIGRATE );
		} else {
			addHostingTrial( site.ID, PLAN_MIGRATION_TRIAL_MONTHLY );
		}
	};

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_site_migration_upgrade_plan_screen', trackingEventsProps )
		);
	}, [] );

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
										link: <Button borderless={ true } onClick={ onContentOnlyClick } />,
									},
								}
							) }
					</SubTitle>
				</div>
			) }

			<UpgradePlanDetails>
				{ isEnabled( 'plans/migration-trial' ) ? (
					<>
						<NextButton
							isBusy={ isAddingTrial }
							disabled={ ! isEligibleForTrialPlan }
							onClick={ onFreeTrialClick }
						>
							{ translate( 'Try 7 days for free' ) }
						</NextButton>
						{ ! isEligibleForTrialPlan && (
							<small>
								{ translate(
									'Free trials are a one-time offer and you’ve already enrolled in one in the past.'
								) }
							</small>
						) }
						<Button
							busy={ isBusy }
							disabled={ isAddingTrial }
							transparent={ ! isAddingTrial }
							onClick={ onCtaClick }
						>
							{ ctaText }
						</Button>
					</>
				) : (
					<NextButton isBusy={ isBusy } onClick={ onCtaClick }>
						{ ctaText }
					</NextButton>
				) }
			</UpgradePlanDetails>
		</div>
	);
};
