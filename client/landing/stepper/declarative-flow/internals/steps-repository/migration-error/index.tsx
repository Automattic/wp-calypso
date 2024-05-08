import { StepContainer } from '@automattic/onboarding';
import clsx from 'clsx';
import ErrorMessage from 'calypso/blocks/importer/components/error-message';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const MigrationError: Step = function ( props ) {
	const { submit } = props.navigation;

	function goToMigrationHandler() {
		submit?.( { url: 'migrationHandler' } );
	}

	function renderError() {
		return <ErrorMessage onPrimaryBtnClick={ goToMigrationHandler } />;
	}
	return (
		<StepContainer
			className={ clsx( 'import__onboarding-page', 'import__error-message' ) }
			stepName="migration-error"
			hideSkip={ true }
			hideBack={ true }
			hideFormattedHeader={ true }
			isWideLayout={ true }
			stepContent={ renderError() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default MigrationError;
