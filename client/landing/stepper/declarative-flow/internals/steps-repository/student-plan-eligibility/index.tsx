import { Step } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { ReactNode, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useDispatch, useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { useFlowLocale } from '../../../../hooks/use-flow-locale';
import { withLocale } from '../../../helpers/with-locale';
import { useStudentPlanEligibility } from './hooks/use-student-plan-eligibility';
import type { Step as StepType } from '../../types';

import './style.scss';

type ScreenProps = {
	title: string;
	subText: ReactNode;
	children: ReactNode;
};

const Screen = ( { title, subText, children }: ScreenProps ) => (
	<>
		<DocumentHead title={ title } />
		<Step.CenteredColumnLayout
			columnWidth={ 6 }
			topBar={ <Step.TopBar /> }
			heading={ <Step.Heading text={ title } subText={ subText } /> }
			className="student-plan-eligibility"
		>
			{ children }
		</Step.CenteredColumnLayout>
	</>
);

const StudentPlanEligibility: StepType< {
	submits: {
		eligible: true;
	};
} > = function StudentPlanEligibility( { navigation } ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const locale = useFlowLocale();
	const email = useSelector( getCurrentUserEmail ) ?? '';
	const { data, isError, isFetching, refetch } = useStudentPlanEligibility();
	const reason = data?.reason;

	useEffect( () => {
		if ( reason === 'eligible' ) {
			navigation.submit?.( { eligible: true } );
		}
	}, [ reason ] ); // eslint-disable-line react-hooks/exhaustive-deps

	if ( isError && ! data ) {
		return (
			<Screen
				title={ __( 'We couldn’t check your email' ) }
				subText={ __( 'Something went wrong. Please try again.' ) }
			>
				<Step.PrimaryButton onClick={ () => refetch() } isBusy={ isFetching }>
					{ __( 'Try again' ) }
				</Step.PrimaryButton>
			</Screen>
		);
	}

	if ( ! data || reason === 'eligible' ) {
		return <Step.Loading />;
	}

	if ( reason === 'unverified' ) {
		return (
			<Screen
				title={ __( 'Confirm your email to get the Student plan' ) }
				subText={ sprintf(
					/* translators: %s is the email address of the account. */
					__( 'Open the confirmation link we sent to %s, then come back to this page.' ),
					email
				) }
			>
				<Step.PrimaryButton onClick={ () => refetch() } isBusy={ isFetching }>
					{ __( 'I’ve confirmed my email' ) }
				</Step.PrimaryButton>
			</Screen>
		);
	}

	if ( reason === 'already_owned' ) {
		return (
			<Screen
				title={ __( 'You already have the Student plan' ) }
				subText={ __(
					'Your account already has an active Student plan. You can find it with your sites and purchases.'
				) }
			>
				<div className="student-plan-eligibility__actions">
					<Step.PrimaryButton href="/sites">{ __( 'Go to my sites' ) }</Step.PrimaryButton>
					<Step.SecondaryButton href="/me/purchases">
						{ __( 'View purchases' ) }
					</Step.SecondaryButton>
				</div>
			</Screen>
		);
	}

	const signUpWithSchoolEmail = () =>
		dispatch( redirectToLogout( window.location.origin + withLocale( '/setup/student', locale ) ) );

	return (
		<Screen
			title={ __( 'The Student plan needs a school email' ) }
			subText={ sprintf(
				/* translators: %s is the email address of the account. */
				__(
					'Your account uses %s. To get the Student plan on your own, sign up with a school email ending in .edu, .ac.uk or .ac.jp.'
				),
				email
			) }
		>
			<div className="student-plan-eligibility__actions">
				<Step.PrimaryButton onClick={ signUpWithSchoolEmail }>
					{ __( 'Sign up with my school email' ) }
				</Step.PrimaryButton>
			</div>
			<p className="student-plan-eligibility__note">
				{ __(
					'No school email? Ask your teacher to apply for your class. Approved classes get a free first year.'
				) }
			</p>
			<ul className="student-plan-eligibility__links">
				<li>
					<a href="https://wp.com/education" target="_blank" rel="noopener noreferrer">
						{ __( 'Share with your teacher' ) }
					</a>
				</li>
				<li>
					<a href={ withLocale( '/setup/education', locale ) }>
						{ __( 'Have an invitation code?' ) }
					</a>
				</li>
			</ul>
			<p className="student-plan-eligibility__footer">
				<a href={ withLocale( '/setup/onboarding', locale ) }>
					{ __( 'Continue with other WordPress.com plans' ) }
				</a>
			</p>
		</Screen>
	);
};

export default StudentPlanEligibility;
