import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { AppState } from 'calypso/types';

export const isInHostingFlow = ( state: AppState ) =>
	getInitialQueryArguments( state )?.[ 'hosting-flow' ] === 'true';
