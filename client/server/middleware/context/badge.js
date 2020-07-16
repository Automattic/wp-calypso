/**
 * Internal dependencies
 */
import config from 'config';

export default ( calypsoEnv ) => {
	const context = {
		abTestHelper: !! config.isEnabled( 'dev/test-helper' ),
		preferencesHelper: !! config.isEnabled( 'dev/preferences-helper' ),
	};

	switch ( calypsoEnv ) {
		case 'wpcalypso':
			context.badge = calypsoEnv;
			context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
			break;

		case 'horizon':
			context.badge = 'feedback';
			context.feedbackURL = 'https://horizonfeedback.wordpress.com/';
			break;

		case 'stage':
			context.badge = 'staging';
			context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
			break;

		case 'development':
			context.badge = 'dev';
			context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
			break;

		case 'jetpack-cloud-stage':
			context.badge = 'jetpack-cloud-staging';
			context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
			break;

		case 'jetpack-cloud-development':
			context.badge = 'jetpack-cloud-dev';
			context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
			break;

		default:
			context.badge = false;
	}

	return context;
};
