import { StepContainer } from '@automattic/onboarding';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import VerifyEmail from './verify-email';
import type { Step } from '../../types';
import type { UserData } from 'calypso/lib/user/user';
import './style.scss';

const HostingVerifyEmail: Step = function ImportVerifyEmail( { navigation } ) {
	const dispatch = useDispatch();
	const { goBack, submit } = navigation;
	const user = useSelector( getCurrentUser ) as UserData;

	// Check if the email is verified and submit it for the next step
	useEffect( () => {
		user.email_verified && submit?.();
	}, [ user, submit ] );

	return (
		<>
			{ ! user.email_verified && (
				<Interval
					onTick={ () => dispatch( fetchCurrentUser() as any ) }
					period={ EVERY_FIVE_SECONDS }
				/>
			) }
			<StepContainer
				stepName="email-verification"
				goBack={ goBack }
				isHorizontalLayout={ false }
				stepContent={ <VerifyEmail /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default HostingVerifyEmail;
