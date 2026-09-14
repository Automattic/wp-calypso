import { recordTracksEvent } from '@automattic/calypso-analytics';
import debug from './debug';

/**
 * Why a survey was suppressed. `modal` is the signal that measures this
 * package's modal-aware suppression; `help_center` is the pre-existing rule,
 * recorded alongside so the two can be compared.
 */
export type SuppressionReason = 'modal' | 'help_center';

/**
 * Which suppression path fired:
 * - `survey_displayed` — a survey rendered and was closed (auto-campaigns).
 * - `modal_opened` — a modal opened on top of an already-visible survey.
 * - `help_center_opened` — the Help Center opened over an already-visible survey.
 * - `invoke_event` — an explicit `invokeSurvicateEvent()` was skipped.
 */
export type SuppressionTrigger =
	| 'survey_displayed'
	| 'modal_opened'
	| 'help_center_opened'
	| 'invoke_event';

/**
 * Records that a survey was suppressed, so we can measure how often (and why)
 * suppression happens — in particular how many surveys the modal rule catches.
 * Fails open: a throwing analytics call never breaks suppression.
 */
export function recordSurveySuppressed(
	reason: SuppressionReason,
	trigger: SuppressionTrigger,
	properties?: Record< string, string | number >
): void {
	debug( 'Survey suppressed (reason=%s, trigger=%s)', reason, trigger );

	try {
		recordTracksEvent( 'calypso_survicate_survey_suppressed', {
			reason,
			trigger,
			...properties,
		} );
	} catch {
		// Analytics is best-effort; never let it interfere with suppression.
	}
}
