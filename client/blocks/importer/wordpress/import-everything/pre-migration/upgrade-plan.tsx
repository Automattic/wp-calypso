import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSite } from 'calypso/state/sites/actions';
import UpgradePlanDetails from './upgrade-plan-details';
import type { URL } from 'calypso/types';

interface Props {
	sourceSiteUrl: URL;
	targetSite: SiteDetails;
	startImport: () => void;
	navigateToVerifyEmailStep: () => void;
	onFreeTrialClick: () => void;
	onContentOnlyClick: () => void;
	isBusy: boolean;
	migrationTrackingProps?: Record< string, unknown >;
}

export const PreMigrationUpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const plan = getPlan( PLAN_BUSINESS );
	const {
		targetSite,
		startImport,
		navigateToVerifyEmailStep,
		onContentOnlyClick,
		isBusy,
		migrationTrackingProps,
	} = props;
	const { data: migrationTrialEligibility } = useCheckEligibilityMigrationTrialPlan(
		targetSite.ID
	);
	const isEligibleForTrialPlan =
		migrationTrialEligibility?.eligible ||
		// If the user's email is unverified, we still want to show the trial plan option
		migrationTrialEligibility?.error_code === 'email-unverified';

	const { addHostingTrial, isLoading: isAddingTrial } = useAddHostingTrialMutation( {
		onSuccess: () => {
			// After the trial is added, we need to request the site again to get the updated plan
			targetSite && dispatch( requestSite( targetSite.ID ) );
		},
	} );

	const onFreeTrialClick = () => {
		if ( migrationTrialEligibility?.error_code === 'email-unverified' ) {
			navigateToVerifyEmailStep();
		} else {
			addHostingTrial( targetSite.ID, PLAN_MIGRATION_TRIAL_MONTHLY );
		}
	};

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_site_migration_upgrade_plan_screen', migrationTrackingProps )
		);
	}, [] );

	return (
		<div className="import__import-everything import__import-everything--redesign">
			<div className="import__heading-title">
				<Title>{ translate( 'Upgrade your plan' ) }</Title>
				<SubTitle>
					{ translate( 'Migrating themes, plugins, users, and settings requires a %(plan)s plan.', {
						args: {
							plan: plan?.getTitle() ?? '',
						},
					} ) }
					<br />
					{ ! isEligibleForTrialPlan &&
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

			<UpgradePlanDetails>
				<NextButton isBusy={ isBusy } disabled={ isAddingTrial } onClick={ () => startImport() }>
					{ translate( 'Upgrade and migrate' ) }
				</NextButton>
				{ isEnabled( 'plans/migration-trial' ) && (
					<>
						<Button
							busy={ isAddingTrial }
							disabled={ ! isEligibleForTrialPlan }
							transparent={ ! isAddingTrial }
							onClick={ onFreeTrialClick }
						>
							{ translate( 'Try 7-days for free' ) }
						</Button>
						{ ! isEligibleForTrialPlan && (
							<small>
								{ translate(
									'Free trials are a one-time offer and you’ve already enrolled in one in the past.'
								) }
							</small>
						) }
					</>
				) }
			</UpgradePlanDetails>
		</div>
	);
};
