import sample from '../assets/images/sample-logo.png';
/**
 * Types & Constants
 */
import { ASYNC_REQUEST_COUNTDOWN_INIT_VALUE, FREE_PLAN_REQUESTS_LIMIT } from './constants';
import { LogoGeneratorStateProp } from './types';

const INITIAL_STATE: LogoGeneratorStateProp = {
	siteDetails: {},
	suggestions: [],
	features: {
		aiAssistantFeature: {
			hasFeature: true,
			isOverLimit: false,
			requestsCount: 0,
			requestsLimit: FREE_PLAN_REQUESTS_LIMIT,
			requireUpgrade: false,
			errorMessage: '',
			errorCode: '',
			upgradeType: 'default',
			currentTier: {
				slug: 'ai-assistant-tier-free',
				value: 0,
				limit: 20,
			},
			usagePeriod: {
				currentStart: '',
				nextStart: '',
				requestsCount: 0,
			},
			nextTier: null,
			tierPlansEnabled: false,
			_meta: {
				isRequesting: false,
				asyncRequestCountdown: ASYNC_REQUEST_COUNTDOWN_INIT_VALUE,
				asyncRequestTimerId: 0,
			},
		},
	},
	history: {
		// TODO: Remove this sample logo
		logos: [
			{
				url: sample,
				description: 'A publishing company in the form of a greek statue.',
			},
		],
		selectedLogoIndex: 0,
	},
};

export default INITIAL_STATE;
