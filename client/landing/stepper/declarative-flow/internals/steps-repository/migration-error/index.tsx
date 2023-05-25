import { StepContainer } from '@automattic/onboarding';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import ErrorMessage from 'calypso/blocks/importer/components/error-message';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const MigrationError: Step = function ( props ) {
	const { navigation } = props;
	const { submit, goBack } = navigation;
	const translate = useTranslate();

	function renderError() {
		return (
			<>
				<ErrorMessage
					onBackToStart={ () => submit?.( { url: 'migrationHandler' } ) }
					onBackToStartText={ translate( 'Try again' ) }
				/>
			</>
		);
	}
	return (
		<StepContainer
			className={ classnames(
				'import__onboarding-page',
				'import-layout__center',
				'importer-wrapper',
				'import__error-message',
				'importer-wrapper__wordpress',
				'is-wide-layout'
			) }
			stepName="importer-step"
			hideSkip={ true }
			hideFormattedHeader={ true }
			isWideLayout={ true }
			goBack={ goBack }
			stepContent={ renderError() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default MigrationError;
