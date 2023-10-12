import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useCheckoutUrl } from 'calypso/blocks/importer/hooks/use-checkout-url';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useCheckMigrationTrialPlanEligibility } from 'calypso/data/plans/use-check-trial-plan-eligibility';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { TrialPlan } from './trial-plan';
import type {
	Step,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { UserData } from 'calypso/lib/user/user';
import type { SiteSlug } from 'calypso/types';

interface Props {
	user: UserData;
	site: SiteDetails;
	siteSlug: SiteSlug;
	flowName: string;
	stepName: string;
	submit?: ( providedDependencies?: ProvidedDependencies, ...params: string[] ) => void;
}

const MigrationTrialAcknowledgeInternal = function ( props: Props ) {
	const { __ } = useI18n();
	const urlQueryParams = useQuery();
	const { user, site, siteSlug, flowName, stepName, submit } = props;

	const { data: migrationTrialEligibility, isLoading: isCheckingEligibility } =
		useCheckMigrationTrialPlanEligibility( site?.ID );
	const isEligibleForTrialPlan = migrationTrialEligibility?.eligible;

	const plan = getPlan( PLAN_BUSINESS );
	const checkoutUrl = useCheckoutUrl( site.ID, siteSlug );
	const { addHostingTrial, isLoading: isAddingTrial } = useAddHostingTrialMutation( {
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

	if ( isAddingTrial || isCheckingEligibility ) {
		return <LoadingEllipsis />;
	} else if ( ! isEligibleForTrialPlan ) {
		return (
			<div className="trial-plan--container">
				<Title>{ __( 'You already have an active free trial' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						__(
							"You're currently enrolled in a free trial. Please wait until it expires to start a new one.<br />To migrate your site now, upgrade to the Business plan."
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
				__( 'Advanced Design Tools' ),
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

export const MigrationTrialAcknowledge: Step = ( { flow, stepName, navigation } ) => {
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
