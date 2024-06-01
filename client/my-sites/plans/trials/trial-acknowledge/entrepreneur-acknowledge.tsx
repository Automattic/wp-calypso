import {
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
	getPlan,
	getFeatureByKey,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import { NextButton, SubTitle } from '@automattic/onboarding';
import { Button, Spinner } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { TrialPlan } from './trial-plan';
import { useVerifyEmail } from './use-verify-email';
import './style.scss';

const FEATURES_NOT_INCLUDED_IN_FREE_TRIAL = [
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
];

type TrialAcknowledgeProps = {
	onStartTrialClick(): void;
	showFeatureList?: boolean;
	CTAButtonState?: {
		isBusy: boolean;
		disabled: boolean;
	};
};

const CallToAction = ( { onStartTrialClick, CTAButtonState }: TrialAcknowledgeProps ) => {
	const { __ } = useI18n();
	const plan = getPlan( PLAN_ECOMMERCE );
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
			<NextButton
				className="entrepreneur-trial-acknowledge__cta"
				isBusy={ CTAButtonState?.isBusy ?? false }
				onClick={ startTrial }
				disabled={ ( ! isVerified || CTAButtonState?.disabled ) ?? false }
			>
				{ sprintf(
					/* translators: the name of the plan that the user will try */
					__( 'Start the %(planName)s trial' ),
					{
						planName: plan?.getTitle(),
					}
				) }
			</NextButton>
		</>
	);
};

export const EntrepreneurTrialAcknowledgement = ( {
	onStartTrialClick,
	showFeatureList = true,
	CTAButtonState,
}: TrialAcknowledgeProps ) => {
	const { __ } = useI18n();
	const plan = getPlan( PLAN_ECOMMERCE );
	const planFeatures =
		showFeatureList && plan && 'getPlanCompareFeatures' in plan
			? plan.getPlanCompareFeatures?.() ?? []
			: [];

	return (
		<TrialPlan
			planFeatures={ planFeatures
				.map( ( feature: string ) => getFeatureByKey( feature ) )
				.filter(
					( feature ) => ! FEATURES_NOT_INCLUDED_IN_FREE_TRIAL.includes( feature.getSlug() )
				)
				.map( ( feature ) => feature.getTitle() as string ) }
			subtitle={ sprintf(
				/* translators: the planName could be "Pro", "Business", "Hosting" or "Entrepreneur"; the trialDuration could be 7 or 14. */
				__(
					'Give the %(planName)s plan a try with the %(trialDuration)d-day free trial, and create your site without costs'
				),
				{ planName: plan?.getTitle(), trialDuration: 14 }
			) }
			supportingCopy={ sprintf(
				/* translators: the planName could be "Pro", "Business", "Hosting" or "Entrepreneur"; the trialDuration could be 7 or 14. */
				__(
					'The %(trialDuration)d-day trial includes every feature in the %(planName)s plan with a few exceptions. To enjoy all the features without limits, upgrade to the paid plan at any time before your trial ends.'
				),
				{ planName: plan?.getTitle(), trialDuration: 14 }
			) }
			callToAction={
				<CallToAction onStartTrialClick={ onStartTrialClick } CTAButtonState={ CTAButtonState } />
			}
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
	const plan = getPlan( PLAN_ECOMMERCE );
	return (
		<SubTitle>
			<p>
				{ sprintf(
					/* translators: plan name, and the email address of the account. the trial duration could be 7 or 14. */
					__(
						'To start your %(planName)s plan %(trialDuration)d-day trial, verify your email address by clicking the link we sent to %(email)s.'
					),
					{
						planName: plan?.getTitle(),
						email: email,
						trialDuration: 14,
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
