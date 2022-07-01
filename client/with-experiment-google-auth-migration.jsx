import config from '@automattic/calypso-config';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useExperiment } from './lib/explat';

const EXPERIMENT_NAME = 'wpcom_google_auth_migration';
const EXPERIMENT_VARIATION_NAME = 'migrated';

export const withExperimentGoogleAuthMigration = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const [ isLoadingExperimentAssignment, experimentAssignment ] =
			useExperiment( EXPERIMENT_NAME );
		if ( isLoadingExperimentAssignment ) {
			return null;
		}
		const isActiveGoogleAuthMigration =
			config.isEnabled( 'migration/sign-in-with-google' ) &&
			experimentAssignment?.variationName === EXPERIMENT_VARIATION_NAME;
		return <Wrapped { ...props } isActiveGoogleAuthMigration={ isActiveGoogleAuthMigration } />;
	},
	'withExperimentGoogleAuthMigration'
);

export default withExperimentGoogleAuthMigration;
