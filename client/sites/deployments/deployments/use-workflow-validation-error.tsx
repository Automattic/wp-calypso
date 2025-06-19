import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { CalypsoDispatch } from 'calypso/state/types';
import { manageDeploymentPage } from '../routes';

const SHOWN_WORKFLOW_ERRORS_KEY = 'github-workflow-validation-errors-shown';

const hasShownWorkflowError = ( runId: number ) => {
	const shownErrors = JSON.parse( localStorage?.getItem( SHOWN_WORKFLOW_ERRORS_KEY ) || '[]' );
	return shownErrors.includes( runId );
};

const markWorkflowErrorAsShown = ( runId: number ) => {
	const shownErrors = JSON.parse( localStorage?.getItem( SHOWN_WORKFLOW_ERRORS_KEY ) || '[]' );
	if ( ! shownErrors.includes( runId ) ) {
		localStorage?.setItem( SHOWN_WORKFLOW_ERRORS_KEY, JSON.stringify( [ ...shownErrors, runId ] ) );
	}
};

export const useWorkflowValidationError = ( dispatch: CalypsoDispatch ) => {
	const showWorkflowValidationError = (
		siteSlug: string,
		deploymentId: number,
		runId?: number
	) => {
		dispatch(
			errorNotice(
				translate( 'The workflow file is invalid. {{a}}Take action{{/a}}', {
					components: {
						a: (
							<a
								href={ manageDeploymentPage( siteSlug, deploymentId ) }
								onClick={ () => {
									dispatch( removeNotice( 'github-invalid-workflow-file' ) );
									dispatch(
										recordTracksEvent( 'calypso_hosting_github_workflow_validation_failure_click' )
									);
								} }
							/>
						),
					},
				} ),
				{
					id: 'github-invalid-workflow-file',
					isPersistent: true,
				}
			)
		);

		if ( runId ) {
			markWorkflowErrorAsShown( runId );
		}
	};

	const shouldShowWorkflowError = ( runId: number ) => {
		return ! hasShownWorkflowError( runId );
	};

	return {
		showWorkflowValidationError,
		shouldShowWorkflowError,
	};
};
