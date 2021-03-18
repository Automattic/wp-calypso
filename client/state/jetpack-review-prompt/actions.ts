/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import PREFERENCE_NAME from './constants';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismissReviewPrompt = () => {
	return savePreference( PREFERENCE_NAME, Date.now() );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismissReviewPromptPermanently = () => {
	return savePreference( PREFERENCE_NAME, 'permanent' );
};

export { dismissReviewPrompt, dismissReviewPromptPermanently };
