/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import SidebarHeader from '../sidebar-header';

const SettingsHeader = ( { openDocumentSettings, openBlockSettings, sidebarName } ) => {
	const blockLabel = __( 'Block' );
	const [ documentAriaLabel, documentActiveClass ] =
		sidebarName === 'edit-post/document'
			? // translators: ARIA label for the Document sidebar tab, selected.
			  [ __( 'Document (selected)' ), 'is-active' ]
			: // translators: ARIA label for the Document sidebar tab, not selected.
			  [ __( 'Document' ), '' ];

	const [ blockAriaLabel, blockActiveClass ] =
		sidebarName === 'edit-post/block'
			? // translators: ARIA label for the Block sidebar tab, selected.
			  [ __( 'Block (selected)' ), 'is-active' ]
			: // translators: ARIA label for the Block sidebar tab, not selected.
			  [ __( 'Block' ), '' ];

	return (
		<SidebarHeader className="edit-post-sidebar__panel-tabs" closeLabel={ __( 'Close settings' ) }>
			{ /* Use a list so screen readers will announce how many tabs there are. */ }
			<ul>
				<li>
					<button
						onClick={ openDocumentSettings }
						className={ `edit-post-sidebar__panel-tab ${ documentActiveClass }` }
						aria-label={ documentAriaLabel }
						data-label={ __( 'Document' ) }
					>
						{ __( 'Document' ) }
					</button>
				</li>
				<li>
					<button
						onClick={ openBlockSettings }
						className={ `edit-post-sidebar__panel-tab ${ blockActiveClass }` }
						aria-label={ blockAriaLabel }
						data-label={ blockLabel }
					>
						{ blockLabel }
					</button>
				</li>
			</ul>
		</SidebarHeader>
	);
};

export default withDispatch( dispatch => {
	const { openGeneralSidebar } = dispatch( 'core/edit-post' );
	const { clearSelectedBlock } = dispatch( 'core/editor' );
	return {
		openDocumentSettings() {
			openGeneralSidebar( 'edit-post/document' );
			clearSelectedBlock();
		},
		openBlockSettings() {
			openGeneralSidebar( 'edit-post/block' );
		},
	};
} )( SettingsHeader );
