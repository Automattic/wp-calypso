/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_REVISIONS } from 'post-editor/editor-sidebar/constants';

const HistoryButton = ( { selectRevision, setNestedSidebar, translate } ) => (
	<div className="editor-ground-control__history">
		<button
			className="editor-ground-control__save button is-link"
			onClick={ function() {
				selectRevision( null );
				setNestedSidebar( NESTED_SIDEBAR_REVISIONS );
			} }
		>
			{ translate( 'History' ) }
		</button>
	</div>
);

export default localize( HistoryButton );
