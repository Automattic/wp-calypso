import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';

const IS_TEST_MODE_ENVIRONMENT = true;
const IS_PRODUCTION_ENVIRONMENT = false;
const PRODUCTION_ENVIRONMENTS = [
	'desktop',
	'production',
	'wpcalypso',
	'jetpack-cloud-production',
	'a8c-for-agencies-production',
];

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;

	// During SU sessions, we want to always target prod. See HAL-154.
	if ( isInSupportSession() ) {
		return IS_PRODUCTION_ENVIRONMENT;
	}

	// If the environment is set to production, we return the production environment.
	if ( PRODUCTION_ENVIRONMENTS.includes( currentEnvironment ) ) {
		return IS_PRODUCTION_ENVIRONMENT;
	}

	// If the environment is not set to production, we return the test mode environment.
	return IS_TEST_MODE_ENVIRONMENT;
};

export const getBadRatingReasons = () => {
	if ( isTestModeEnvironment() ) {
		return [
			{ label: 'No reason provided', value: '' },
			{ label: 'It took too long to get a reply.', value: '1001' },
			{ label: 'The product cannot do what I want.', value: '1002' },
			{ label: 'The issue was not resolved.', value: '1003' },
			{ label: 'The Happiness Engineer was unhelpful.', value: '1004' },
		];
	}

	return [
		{ label: 'No reason provided', value: '' },
		{ label: 'It took too long to get a reply.', value: '1000' },
		{ label: 'The product cannot do what I want.', value: '1001' },
		{ label: 'The issue was not resolved.', value: '1002' },
		{ label: 'The Happiness Engineer was unhelpful.', value: '1003' },
	];
};
