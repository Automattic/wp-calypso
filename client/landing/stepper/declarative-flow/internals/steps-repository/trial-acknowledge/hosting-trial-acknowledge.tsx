import {
	FEATURE_50GB_STORAGE,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	PLAN_BUSINESS,
	getPlan,
} from '@automattic/calypso-products';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { Button, Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { TrialPlan } from './trial-plan';
import { useVerifyEmail } from './use-verify-email';

const FEATURES_NOT_INCLUDED_IN_FREE_TRIAL = [
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_50GB_STORAGE,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
];

interface Props {
	goBack?: () => void;
	onStartTrialClick(): void;
}

const CallToAction = ( { onStartTrialClick }: Props ) => {
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

const HostingTrialAcknowledgeInternal = ( { onStartTrialClick, goBack }: Props ) => {
	const { __ } = useI18n();
	const plan = getPlan( PLAN_BUSINESS );
	const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
	const planFeatures =
		plan && 'getPlanCompareFeatures' in plan ? plan.getPlanCompareFeatures?.() ?? [] : [];

	if ( ! isEligible ) {
		return (
			<div className="trial-plan--container">
				<Title>{ __( 'You already enrolled in a trial' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						__(
							"You've already enrolled in a free trial and is not eligible for a new one.<br />Upgrade now to continue enjoying the benefits of a Business plan."
						),
						{ br: <br /> }
					) }
				</SubTitle>
				<NextButton onClick={ goBack }>{ __( 'Upgrade now' ) }</NextButton>
			</div>
		);
	}

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
	return (
		<HostingTrialAcknowledgeInternal
			onStartTrialClick={ () => navigation.submit?.() }
			goBack={ navigation.goBack }
		/>
	);
};
