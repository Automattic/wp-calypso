import { StepContainer } from '@automattic/onboarding';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import VerifyEmail from './verify-email';
import type { Step } from '../../types';
import type { UserData } from 'calypso/lib/user/user';
import './style.scss';

const ImportVerifyEmail: Step = function ImportVerifyEmail( { navigation, data } ) {
	const dispatch = useDispatch();
	const { goBack, submit } = navigation;
	const user = useSelector( getCurrentUser ) as UserData;
	const site = useSite();

	// Check if the email is verified and submit it for the next step
	useEffect( () => {
		user.email_verified && submit?.();
	}, [ user, submit ] );

	if ( ! site ) {
		return null;
	}

	// Default behavior is to poll to see if the email has been verified
	let pollForEmailVerification = true;
	if ( data?.pollForEmailVerification !== undefined ) {
		// But we can optionally disable polling by passing data.pollForEmailVerification = false
		pollForEmailVerification = data?.pollForEmailVerification as boolean;
	}

	return (
		<>
			{ pollForEmailVerification && ! user.email_verified && (
				<>
					<span
						id="email-verification-interval"
						data-testid="email-verification-interval"
						style={ { display: 'none' } }
					/>
					<Interval
						onTick={ () => dispatch( fetchCurrentUser() as any ) }
						period={ EVERY_FIVE_SECONDS }
					/>
				</>
			) }
			<StepContainer
				className="import-layout__center"
				stepName="email-verification"
				skipButtonAlign="top"
				goBack={ goBack }
				isHorizontalLayout={ false }
				stepContent={ <VerifyEmail user={ user } site={ site } /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default ImportVerifyEmail;
