import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import VerifyEmail from './verify-email';
import type { Step } from '../../types';
import './style.scss';

const ImportVerifyEmail: Step = function ImportVerifyEmail( { navigation } ) {
	const { goBack } = navigation;

	return (
		<StepContainer
			className="import-layout__center"
			stepName="email-verification"
			skipButtonAlign="top"
			goBack={ goBack }
			isHorizontalLayout={ false }
			stepContent={ <VerifyEmail /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImportVerifyEmail;
