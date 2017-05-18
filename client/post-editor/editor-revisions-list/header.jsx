/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const EditorRevisionsListHeader = ( { loadRevision, selectedRevisionId, translate } ) => (
	<div className="editor-revisions-list__header">
		<Button
			className="editor-revisions-list__load-revision"
			compact={ true }
			disabled={ selectedRevisionId === null }
			onClick={ loadRevision }
		>
			{ translate( 'Load revision in the editor' ) }
		</Button>
	</div>
);

EditorRevisionsListHeader.propTypes = {
	loadRevision: PropTypes.func,
	selectedRevisionId: PropTypes.number,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListHeader );
