import helpLinks from './mock-help-links';
import { action as ActionTypes } from 'lib/help-search/constants';

export default {
	fetchedHelpLinks: {
		type: ActionTypes.SET_HELP_LINKS,
		helpLinks: helpLinks
	}
};
