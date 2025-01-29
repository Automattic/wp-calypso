import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import hasCompletedReaderProfile from 'calypso/state/selectors/has-completed-reader-profile';
import { AppState } from 'calypso/types';

export default ( state: AppState ): boolean => {
	const hasCompletedProfile = hasCompletedReaderProfile( state );
	const fromReaderOnboarding = getCurrentQueryArguments( state )?.ref === 'reader-onboarding';

	return hasCompletedProfile && fromReaderOnboarding;
};
