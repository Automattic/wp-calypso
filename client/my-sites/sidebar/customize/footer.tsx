/**
 * Customize-mode footer with auto-save status, Undo, Retry, and Done.
 *
 * Mirrors `renderFooter` + `updateFooter` in the public plugin's
 * `customizer/customizer.js` v0.1.10.
 */

import { translate } from 'i18n-calypso';
import { useCustomizeContext } from './index';
import type { CustomizerDraftState } from './draft-state';

const FOOTER_CLASS = 'admin-sidebar-customize-footer';

export function CustomizeFooter() {
	const ctx = useCustomizeContext();
	if ( ! ctx || ! ctx.isCustomizing ) {
		return null;
	}
	const { draft, exit, undo, retry, canUndo, hasPendingSave, lastSavedAt } = ctx;
	const status = getStatusText( draft, hasPendingSave, lastSavedAt );

	return (
		<div className={ FOOTER_CLASS }>
			<div className={ `${ FOOTER_CLASS }__status` } role="status" aria-live="polite">
				{ status }
			</div>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__undo` }
				disabled={ ! canUndo }
				onClick={ undo }
			>
				{ translate( 'Undo' ) }
			</button>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__retry` }
				hidden={ ! draft.saveError }
				disabled={ draft.isSaving }
				onClick={ retry }
			>
				{ translate( 'Retry' ) }
			</button>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__done` }
				disabled={ draft.isSaving || hasPendingSave }
				onClick={ () => exit( { confirmIfDirty: true } ) }
			>
				{ translate( 'Done' ) }
			</button>
		</div>
	);
}

export default CustomizeFooter;

function getStatusText(
	draft: CustomizerDraftState,
	hasPendingSave: boolean,
	lastSavedAt: number
) {
	if ( draft.saveError ) {
		return draft.saveError.message;
	}
	if ( draft.isSaving || hasPendingSave ) {
		return translate( 'Saving…' );
	}
	if ( draft.isDirty ) {
		return translate( 'Unsaved changes.' );
	}
	if ( lastSavedAt ) {
		return translate( 'Saved.' );
	}
	return translate( 'Changes save automatically.' );
}
