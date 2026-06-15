/**
 * Customize-mode footer with Reset all, Undo, Retry, and Done.
 *
 * Mirrors `renderFooter` + `updateFooter` in the public plugin's
 * `customizer/customizer.js`.
 */

import { Button, Modal } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useCustomizeContext } from './index';

const FOOTER_CLASS = 'admin-sidebar-customize-footer';

export function CustomizeFooter() {
	const ctx = useCustomizeContext();
	const [ isResetModalOpen, setResetModalOpen ] = useState( false );
	if ( ! ctx || ! ctx.isCustomizing ) {
		return null;
	}
	const { draft, exit, undo, retry, canUndo, canResetAll, hasPendingSave, resetAll } = ctx;
	const isSaving = draft.isSaving || hasPendingSave;
	const closeResetModal = () => setResetModalOpen( false );
	const confirmResetAll = () => {
		resetAll();
		closeResetModal();
	};

	return (
		<div className={ FOOTER_CLASS }>
			<button
				type="button"
				className={ `${ FOOTER_CLASS }__reset-all` }
				disabled={ ! canResetAll }
				onClick={ () => setResetModalOpen( true ) }
			>
				<svg
					className={ `${ FOOTER_CLASS }__reset-all-icon` }
					width="15"
					height="15"
					viewBox="0 0 24 24"
					aria-hidden="true"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill="currentColor"
						d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
					/>
				</svg>
				<span className={ `${ FOOTER_CLASS }__reset-all-label` }>{ translate( 'Reset all' ) }</span>
			</button>
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
				disabled={ isSaving }
				onClick={ () => exit( { confirmIfDirty: true } ) }
			>
				{ isSaving ? translate( 'Saving…' ) : translate( 'Done' ) }
			</button>
			{ isResetModalOpen && (
				<Modal
					title={ translate( 'Reset all to default?' ) as string }
					className="admin-sidebar-reset-all-modal"
					size="small"
					onRequestClose={ closeResetModal }
				>
					<p className="admin-sidebar-reset-all-modal__body">
						{ translate(
							'This restores the default order and grouping for every item in the sidebar. Your current customizations will be removed.'
						) }
					</p>
					<div className="admin-sidebar-reset-all-modal__actions">
						<Button variant="tertiary" onClick={ closeResetModal }>
							{ translate( 'Cancel' ) }
						</Button>
						<Button variant="primary" onClick={ confirmResetAll }>
							{ translate( 'Reset all' ) }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
}

export default CustomizeFooter;
