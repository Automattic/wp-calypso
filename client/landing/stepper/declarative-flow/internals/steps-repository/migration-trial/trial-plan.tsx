import { getPlan, PLAN_BUSINESS, PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import React, { useState } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';
import { useCheckoutUrl } from 'calypso/blocks/importer/hooks/use-checkout-url';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import useSupportedTrialFeatureList from './hooks/use-supported-trial-feature-list';
import TrialPlanFeaturesModal from './trial-plan-features-modal';
import type { ProvidedDependencies } from 'calypso/landing/stepper/declarative-flow/internals/types';
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
const TrialPlan = function ( props: Props ) {
	const { __ } = useI18n();
	const urlQueryParams = useQuery();
	const { user, site, siteSlug, flowName, stepName, submit } = props;
	const [ showPlanFeaturesModal, setShowPlanFeaturesModal ] = useState( false );
	const { data: migrationTrialEligibility, isLoading: isCheckingEligibility } =
		useCheckEligibilityMigrationTrialPlan( site?.ID );
	const isEligibleForTrialPlan = migrationTrialEligibility?.eligible;

	const trialFeatureList = useSupportedTrialFeatureList();
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
		<>
			{ showPlanFeaturesModal && (
				<TrialPlanFeaturesModal
					plan={ plan }
					onClose={ () => {
						setShowPlanFeaturesModal( false );
					} }
				/>
			) }

			<div className="trial-plan--container">
				<Title>{ __( 'Try before you buy' ) }</Title>
				<SubTitle>
					{ sprintf(
						/* translators: the planName could be "Pro" or "Business" */
						__(
							'Give the %(planName)s plan a try with the 7-day free trial, and migrate your site without costs'
						),
						{ planName: plan?.getTitle() }
					) }
				</SubTitle>

				<p>
					{ sprintf(
						/* translators: the planName could be "Pro" or "Business" */
						__(
							'The 7-day trial includes every feature in the %(planName)s plan with a few exceptions. To enjoy all the features without limits, upgrade to the paid plan at any time before your trial ends.'
						),
						{ planName: plan?.getTitle() }
					) }
				</p>

				<div className="trial-plan--details">
					<div className="trial-plan--details-features">
						<ul>
							{ trialFeatureList.map( ( feature, i ) => (
								<li key={ i }>
									<Icon size={ 20 } icon={ check } /> { feature }
								</li>
							) ) }
						</ul>
					</div>
				</div>

				<div className="trial-plan--details-limitation">
					<img src={ clockIcon } alt={ __( 'Limit' ) } />
					<p>
						<strong>{ __( 'Trial limitations' ) }</strong>
						<br />
						<small>{ __( '100 subscribers, no SSH or SFTP access' ) }</small>
					</p>
				</div>

				<NextButton isBusy={ isAddingTrial } onClick={ onStartTrialClick }>
					{ __( 'Start the trial and migrate' ) }
				</NextButton>
			</div>
		</>
	);
};

export default TrialPlan;
