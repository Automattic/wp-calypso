import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';
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
	const translate = useTranslate();
	let importSiteHostName = translate( 'your site' );
	const dispatch = useDispatch();

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

	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';

	const showModal =
		isEnabled( 'migration_assistance_modal' ) &&
		getQueryArg( window.location.href, 'showModal' )?.toString() === 'true';

	try {
		importSiteHostName = new URL( importSiteQueryParam )?.hostname;
	} catch ( e ) {}

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

	const renderCTAs = () => {
		const cta = ctaText === '' ? translate( 'Continue' ) : ctaText;
		const trialText = translate( 'Try 7 days for free' );

		if ( ! isEnabled( 'plans/migration-trial' ) ) {
			return (
				<NextButton isBusy={ isBusy } onClick={ onCtaClick }>
					{ cta }
				</NextButton>
			);
		}

		if ( isEligibleForTrialPlan ) {
			return (
				<>
					<NextButton isBusy={ isAddingTrial } onClick={ onFreeTrialClick }>
						{ trialText }
					</NextButton>
					<Button
						busy={ isBusy }
						disabled={ isAddingTrial }
						transparent={ ! isAddingTrial }
						onClick={ onCtaClick }
					>
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
				<Button disabled={ true } transparent={ true }>
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

	const navigateBack = () => {
		const queryParams = new URLSearchParams( window.location.search );
		queryParams.delete( 'siteSlug' );
		queryParams.delete( 'showModal' );
		// Navigate back to site picker keeping necessary the query params.
		window.location.assign( `sitePicker?${ queryParams.toString() }` );
	};

	return (
		<div className="import__upgrade-plan">
			{ showModal && (
				<ConfirmModal
					compact={ false }
					title={ translate( 'Migration sounds daunting? It shouldn’t be!' ) }
					confirmText="Take the deal"
					cancelText="No, thanks"
					onClose={ navigateBack }
					onConfirm={ () => {} }
				>
					<p>
						{ translate(
							`Subscribe to the Creator plan now, and get a complimentary migration service (normally $500) to move %(importSiteHostName)s to WordPress.com.`,
							{
								args: {
									importSiteHostName,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'Take this deal now and let our Happiness Engineers make the move seamless and stress-free.'
						) }
					</p>
				</ConfirmModal>
			) }
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

			<UpgradePlanDetails isEligibleForTrialPlan={ isEligibleForTrialPlan }>
				{ renderCTAs() }
			</UpgradePlanDetails>
		</div>
	);
};
