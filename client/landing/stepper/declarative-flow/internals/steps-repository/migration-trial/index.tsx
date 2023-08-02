import { StepContainer } from '@automattic/onboarding';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import TrialPlan from './trial-plan';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { UserData } from 'calypso/lib/user/user';
import './style.scss';

const MigrationTrial: Step = function MigrationTrial( { navigation } ) {
	const site = useSite();
	const user = useSelector( getCurrentUser ) as UserData;
	const { goBack, submit } = navigation;

	if ( ! site ) {
		return null;
	}

	return (
		<StepContainer
			stepName="migration-trial"
			className="import-layout__center"
			hideSkip={ true }
			hideBack={ false }
			hideFormattedHeader={ true }
			goBack={ goBack }
			isWideLayout={ false }
			stepContent={ <TrialPlan user={ user } site={ site } submit={ submit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default MigrationTrial;
