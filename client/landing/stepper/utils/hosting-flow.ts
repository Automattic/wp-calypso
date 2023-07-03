import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { AppState } from 'calypso/types';

export const startedInHostingFlow = ( state: AppState ) =>
	getInitialQueryArguments( state )?.[ 'hosting-flow' ] === 'true';

export const useIsCurrentlyHostingFlow = () =>
	useSelector(
		( state: AppState ) => getCurrentQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);
