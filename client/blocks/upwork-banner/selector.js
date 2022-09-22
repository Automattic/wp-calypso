import { getPreference } from 'calypso/state/preferences/selectors';
import { UPWORK_BANNER_STATE } from './constants';

export const isUpworkBannerDismissed = ( state ) => {
	return getPreference( state, UPWORK_BANNER_STATE ) || false;
};
