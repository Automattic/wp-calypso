import { getPreference } from 'calypso/state/preferences/selectors';
import { getPreferenceKey } from './utils';

export const isCardDismissed = ( preferenceName ) => ( state ) =>
	getPreference( state, getPreferenceKey( preferenceName ) );
