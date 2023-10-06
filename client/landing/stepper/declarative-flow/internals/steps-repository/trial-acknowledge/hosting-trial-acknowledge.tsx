import {
	FEATURE_50GB_STORAGE,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	PLAN_BUSINESS,
	getPlan,
} from '@automattic/calypso-products';
import { NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { TrialPlan } from './trial-plan';
import type { Step } from '../../types';

const FEATURES_NOT_INCLUDED_IN_FREE_TRIAL = [
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_50GB_STORAGE,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
];

interface CallToActionProps {
	onStartTrialClick(): void;
}

const CallToAction = ( { onStartTrialClick }: CallToActionProps ) => {
	const { __ } = useI18n();

	return (
		<NextButton isBusy={ false } onClick={ onStartTrialClick }>
			{ __( 'Start the Business trial' ) }
		</NextButton>
	);
};

const HostingTrialAcknowledgeInternal = ( { onStartTrialClick }: CallToActionProps ) => {
	const { __ } = useI18n();
	const plan = getPlan( PLAN_BUSINESS );

	const planFeatures =
		plan && 'getPlanCompareFeatures' in plan ? plan.getPlanCompareFeatures?.() ?? [] : [];

	return (
		<TrialPlan
			planFeatures={ planFeatures
				.map( ( feature: string ) => getFeatureByKey( feature ) )
				.filter(
					( feature ) => ! FEATURES_NOT_INCLUDED_IN_FREE_TRIAL.includes( feature.getSlug() )
				)
				.map( ( feature ) => feature.getTitle() as string ) }
			subtitle={ sprintf(
				/* translators: the planName could be "Pro" or "Business" */
				__(
					'Give the %(planName)s plan a try with the 7-day free trial, and create your site without costs'
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
			callToAction={ <CallToAction onStartTrialClick={ onStartTrialClick } /> }
			trialLimitations={ [
				__( 'Limited email sending capabilities' ),
				__( '3GB of storage' ),
				__( 'no domain mapping' ),
				__( '3 support requests' ),
			] }
		/>
	);
};

export const HostingTrialAcknowledge: Step = ( { navigation } ) => {
	return <HostingTrialAcknowledgeInternal onStartTrialClick={ () => navigation.submit?.() } />;
};
