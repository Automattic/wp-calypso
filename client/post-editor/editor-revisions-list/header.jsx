/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

function EditorRevisionsListHeader( { restoreRevision, translate } ) {
	return (
		<div className="editor-revisions-list__header">
			<h3>{ translate( 'You\'re seeing the latest changes' ) }</h3>
			<Button
				className="editor-revisions-list__restore-revision"
				onClick={ restoreRevision }
				compact={ true }
			>
				{ translate( 'Restore this revision' ) }
			</Button>
		</div>
	);
}

EditorRevisionsListHeader.propTypes = {
	restoreRevision: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListHeader );
