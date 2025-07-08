import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';

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
			{ label: __( 'No reason provided', __i18n_text_domain__ ), value: '' },
			{ label: __( 'It took too long to get a reply.', __i18n_text_domain__ ), value: '1001' },
			{ label: __( 'The product cannot do what I want.', __i18n_text_domain__ ), value: '1002' },
			{ label: __( 'The issue was not resolved.', __i18n_text_domain__ ), value: '1003' },
			{ label: __( 'The Happiness Engineer was unhelpful.', __i18n_text_domain__ ), value: '1004' },
		];
	}

	return [
		{ label: __( 'No reason provided', __i18n_text_domain__ ), value: '' },
		{ label: __( 'It took too long to get a reply.', __i18n_text_domain__ ), value: '1000' },
		{ label: __( 'The product cannot do what I want.', __i18n_text_domain__ ), value: '1001' },
		{ label: __( 'The issue was not resolved.', __i18n_text_domain__ ), value: '1002' },
		{ label: __( 'The Happiness Engineer was unhelpful.', __i18n_text_domain__ ), value: '1003' },
	];
};
