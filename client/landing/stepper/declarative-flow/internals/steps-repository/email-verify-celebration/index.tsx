import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';
import './style.scss';

const EmailVerifyCelebration: Step = function EmailVerifyCelebration( { navigation } ) {
	const { goBack, goNext } = navigation;
	const { __ } = useI18n();
	const user = useSelector( getCurrentUser ) as UserData;

	function getContent() {
		return (
			<div className="email-verify-celebration__content">
				<Button className="email-verify-celebration__button" primary>
					{ __( 'Resend verification email' ) }
				</Button>
				<br />
				<Button className="email-verify-celebration__link" borderless href="https://anchor.fm">
					{ __( 'Edit email address' ) }
				</Button>
			</div>
		);
	}

	const userName = user.display_name;
	const userEmail = user.email;

	const headerText = createInterpolateElement(
		/* translators: the userName is the display name of the user, eg: Valter */
		sprintf( __( "You're all set %(userName)s! <br />We just need to verify your email." ), {
			userName,
		} ),
		{ br: createElement( 'br' ) }
	);

	const subHeaderText = createInterpolateElement(
		sprintf(
			/* translators: the userEmail is the email of the user */
			__(
				'A verification email has been sent to %(userEmail)s. <br />Please continue your journey from the following the link sent.'
			),
			{ userEmail }
		),
		{ br: createElement( 'br' ) }
	);

	return (
		<StepContainer
			stepName={ 'email-verify-celebration-step' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			formattedHeader={
				<FormattedHeader
					id={ 'email-verify-celebration-title-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
			hideBack
			hideSkip
			hideNext
		/>
	);
};

export default EmailVerifyCelebration;
