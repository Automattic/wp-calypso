import { getPreference } from 'calypso/state/preferences/selectors';
import { getPreferenceKey } from './utils';

export const isBlockDismissed = ( preferenceName ) => ( state ) =>
	getPreference( state, getPreferenceKey( preferenceName ) );
