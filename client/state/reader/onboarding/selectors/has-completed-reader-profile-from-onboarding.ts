import hasCompletedReaderProfile from 'calypso/state/reader/onboarding/selectors/has-completed-reader-profile';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { AppState } from 'calypso/types';

export default ( state: AppState ): boolean => {
	const hasCompletedProfile = hasCompletedReaderProfile( state );
	const fromReaderOnboarding = getCurrentQueryArguments( state )?.ref === 'reader-onboarding';

	return hasCompletedProfile && fromReaderOnboarding;
};
