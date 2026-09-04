import { loadScript } from '@automattic/load-script';
import { closeSurvicateSurvey } from './close-survey';
import debug from './debug';
import { shouldSuppressSurvey } from './invoke-event';
import { observeModals } from './modal-detection';

/**
 * Checks whether the Survicate script is already loaded on the page.
 */
export function isSurvicateScriptLoaded(): boolean {
	return typeof window._sva !== 'undefined';
}

/**
 * Loads the Survicate survey script for the given workspace.
 * Deduplication is handled by @automattic/load-script.
 *
 * Pass an `AbortSignal` to tear down the `survey_displayed` listener and the
 * modal observer wired at `SurvicateReady` time. Without one they live for the
 * page lifetime; the consumer (`useSurvicate`) passes its effect's signal so
 * repeated calls don't accumulate observers.
 */
export function loadSurvicateScript( workspaceId: string, signal?: AbortSignal ): Promise< void > {
	debug( 'Loading Survicate script for workspace %s', workspaceId );

	const onSurveyDisplayed = () => {
		debug( 'Survicate survey displayed' );

		if ( shouldSuppressSurvey() ) {
			debug( 'Survicate survey suppressed (Help Center or a modal is open)' );
			closeSurvicateSurvey();
		}
	};

	const wireSuppression = () => {
		if ( signal?.aborted ) {
			return;
		}

		window._sva?.addEventListener?.( 'survey_displayed', onSurveyDisplayed );

		// Close a survey that is already on screen when a modal opens on top of
		// it. closeSurvicateSurvey() is a no-op without a visible survey.
		const disconnectModalObserver = observeModals( closeSurvicateSurvey );

		signal?.addEventListener(
			'abort',
			() => {
				window._sva?.removeEventListener?.( 'survey_displayed', onSurveyDisplayed );
				disconnectModalObserver();
			},
			{ once: true }
		);
	};

	// `SurvicateReady` fires only once per page load. A call made after the SDK
	// has already loaded (e.g. the consumer effect re-running on a dependency
	// change) must wire suppression immediately, or it would never be
	// re-established after an earlier abort tore it down.
	if ( isSurvicateScriptLoaded() ) {
		wireSuppression();
	} else {
		window.addEventListener( 'SurvicateReady', wireSuppression, { once: true } );
		signal?.addEventListener(
			'abort',
			() => window.removeEventListener( 'SurvicateReady', wireSuppression ),
			{ once: true }
		);
	}

	return loadScript(
		`https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`
	).then( () => {
		debug( 'Survicate script loaded successfully' );
	} );
}
