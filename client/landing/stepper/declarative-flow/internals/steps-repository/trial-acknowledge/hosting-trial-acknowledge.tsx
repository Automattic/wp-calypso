import {
	FEATURE_50GB_STORAGE,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	PLAN_BUSINESS,
	getPlan,
} from '@automattic/calypso-products';
import { NextButton, SubTitle } from '@automattic/onboarding';
import { Button, Spinner } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { TrialPlan } from './trial-plan';
import { useVerifyEmail } from './use-verify-email';
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
	const { isVerified, hasUser, isSending, email, resendEmail } = useVerifyEmail();
	const startTrial = () => {
		if ( ! isVerified ) {
			return;
		}
		onStartTrialClick();
	};

	return (
		<>
			{ ! isVerified && hasUser && (
				<EmailVerification isSending={ isSending } email={ email } resendEmail={ resendEmail } />
			) }
			<NextButton isBusy={ false } onClick={ startTrial } disabled={ ! isVerified }>
				{ __( 'Start the Business trial' ) }
			</NextButton>
		</>
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
			trialLimitations={ [ __( 'Lower priority email sending' ), __( '3GB of storage' ) ] }
		/>
	);
};

function EmailVerification( {
	isSending,
	email,
	resendEmail,
}: {
	isSending: boolean;
	email?: string;
	resendEmail: () => void;
} ) {
	const { __ } = useI18n();
	return (
		<SubTitle>
			<p>
				{ sprintf(
					/* translators: the email address of the account*/
					__(
						'To start your Business plan 7-day trial, verify your email address by clicking the link we sent to %(email)s.'
					),
					{
						email: email,
					}
				) }
				<Button
					onClick={ () => resendEmail() }
					variant="link"
					size="default"
					style={ {
						marginLeft: '0.3em',
						fontSize: 'inherit',
						color: 'inherit',
					} }
				>
					{ __( 'Resend verification email' ) }
				</Button>
				{ isSending && <Spinner /> }
			</p>
		</SubTitle>
	);
}

export const HostingTrialAcknowledge: Step = ( { navigation } ) => {
	return <HostingTrialAcknowledgeInternal onStartTrialClick={ () => navigation.submit?.() } />;
};
