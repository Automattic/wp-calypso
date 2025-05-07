import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { buildCheckoutUrl } from 'calypso/blocks/importer/util';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { TrialPlan } from 'calypso/my-sites/plans/trials/trial-acknowledge/trial-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { UserData } from 'calypso/lib/user/user';
import type { SiteSlug } from 'calypso/types';

interface Props {
	user: UserData;
	site: SiteDetails;
	siteSlug: SiteSlug;
	flowName: string;
	stepName: string;
	submit: ( providedDependencies: {
		action: 'verify-email' | 'importer' | 'checkout';
		checkoutUrl?: string;
	} ) => void;
}

const MigrationTrialAcknowledgeInternal = function ( props: Props ) {
	const { __ } = useI18n();
	const hasEnTranslation = useHasEnTranslation();
	const urlQueryParams = useQuery();
	const { user, site, siteSlug, flowName, stepName, submit } = props;
	const { data: migrationTrialEligibility, isLoading: isCheckingEligibility } =
		useCheckEligibilityMigrationTrialPlan( site?.ID );
	const isEligibleForTrialPlan = migrationTrialEligibility?.eligible;
	const eligibilityErrorCode = migrationTrialEligibility?.error_code;
	const plan = getPlan( PLAN_BUSINESS );
	const { addHostingTrial, isPending: isAddingTrial } = useAddHostingTrialMutation( {
		onSuccess: () => {
			navigateToImporterStep();
		},
	} );

	function navigateToVerifyEmailStep() {
		submit?.( { action: 'verify-email' } );
	}

	function navigateToImporterStep() {
		submit?.( { action: 'importer' } );
	}

	function navigateToCheckoutPage() {
		const checkoutUrl = buildCheckoutUrl( siteSlug );
		const returnUrl = `/setup/${ flowName }/${ stepName }?${ urlQueryParams.toString() }`;
		const preparedCheckoutUrl = addQueryArgs( checkoutUrl, {
			redirect_to: returnUrl,
			cancel_to: returnUrl,
		} );

		submit?.( { action: 'checkout', checkoutUrl: preparedCheckoutUrl } );
	}

	function onStartTrialClick() {
		if ( ! user?.email_verified ) {
			navigateToVerifyEmailStep();
		} else {
			addHostingTrial( site.ID, PLAN_MIGRATION_TRIAL_MONTHLY );
		}
	}

	useEffect( () => {
		switch ( eligibilityErrorCode ) {
			case 'email-unverified':
				navigateToVerifyEmailStep();
				break;
		}
	}, [ eligibilityErrorCode ] );

	if ( isAddingTrial || isCheckingEligibility ) {
		return <LoadingEllipsis />;
	} else if ( ! isEligibleForTrialPlan ) {
		return (
			<div className="trial-plan--container">
				<Title>{ __( 'You already have an active free trial' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						sprintf(
							/* translators: the planName is the short-from of the Business plan */
							__(
								"You're currently enrolled in a free trial. Please wait until it expires to start a new one.<br />To migrate your site now, upgrade to the %(planName)s plan."
							),
							{ planName: plan?.getTitle() }
						),
						{ br: <br /> }
					) }
				</SubTitle>
				<NextButton onClick={ navigateToCheckoutPage }>{ __( 'Purchase and migrate' ) }</NextButton>
			</div>
		);
	}

	return (
		<TrialPlan
			planFeatures={ [
				__( 'Beautiful themes' ),
				hasEnTranslation( 'Advanced design tools' )
					? __( 'Advanced design tools' )
					: __( 'Advanced Design Tools' ),
				__( 'Newsletters' ),
				__( 'Jetpack backups and restores' ),
				__( 'Spam protection with Akismet' ),
				__( 'SEO tools' ),
				__( 'Google Analytics' ),
				__( 'Best-in-class hosting' ),
			] }
			subtitle={ sprintf(
				/* translators: the planName could be "Pro" or "Business" */
				__(
					'Give the %(planName)s plan a try with the 7-day free trial, and migrate your site without costs'
				),
				{ planName: plan?.getTitle() }
			) }
			supportingCopy={ sprintf(
				/* translators: the planName could be "Pro" or "Business" */
				__(
					'The 7-day trial includes every feature in the %(planName)s plan with a few exceptions. To enjoy all the features without limits, upgrade to the paid plan at any time before your trial ends.'
				),
				{ planName: plan?.getTitle() }
			) }
			callToAction={
				<NextButton isBusy={ isAddingTrial } onClick={ onStartTrialClick }>
					{ __( 'Start the trial and migrate' ) }
				</NextButton>
			}
			trialLimitations={ [ __( '100 subscribers' ), __( 'no SSH or SFTP access' ) ] }
		/>
	);
};

export const MigrationTrialAcknowledge: Step< {
	submits: {
		action: 'verify-email' | 'importer' | 'checkout';
		checkoutUrl?: string;
	};
} > = ( { flow, stepName, navigation } ) => {
	const site = useSite();
	const siteSlug = useSiteSlug();
	const user = useSelector( getCurrentUser ) as UserData;

	if ( ! site || ! siteSlug ) {
		return null;
	}

	return (
		<MigrationTrialAcknowledgeInternal
			flowName={ flow }
			stepName={ stepName }
			user={ user }
			site={ site }
			siteSlug={ siteSlug }
			submit={ navigation.submit }
		/>
	);
};
