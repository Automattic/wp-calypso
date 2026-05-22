/**
 * Customize-mode footer with Save / Cancel buttons.
 *
 * Mirrors `renderFooter` + `updateFooter` in the public plugin's
 * `customizer/customizer.js` v0.1.4 — same disabled-until-dirty rule, same
 * "Saving…" text while the POST is in flight, same Cancel-confirms-on-dirty
 * behaviour.
 *
 * Identical-behaviour anchor: Phase 2 row 23 (footer Save/Cancel).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/customizer.js#renderFooter
 */

import { translate } from 'i18n-calypso';
import { useCustomizeContext } from './index';

const FOOTER_CLASS = 'admin-sidebar-customize-footer';

export function CustomizeFooter() {
	const ctx = useCustomizeContext();
	if ( ! ctx || ! ctx.isCustomizing ) {
		return null;
	}
	const { draft, exit, save } = ctx;
	const saveDisabled = ! draft.isDirty || draft.isSaving;
	const saveLabel = draft.isSaving ? translate( 'Saving…' ) : translate( 'Save' );

	return (
		<div className={ FOOTER_CLASS }>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__cancel` }
				onClick={ () => exit( { confirmIfDirty: true } ) }
			>
				{ translate( 'Cancel' ) }
			</button>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__save` }
				disabled={ saveDisabled }
				onClick={ () => {
					void save();
				} }
			>
				{ saveLabel }
			</button>
			{ draft.saveError && (
				<div className={ `${ FOOTER_CLASS }__error` } role="alert">
					{ draft.saveError.message }
				</div>
			) }
		</div>
	);
}

export default CustomizeFooter;
