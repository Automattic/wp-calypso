/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const EditorRevisionsListHeader = ( { loadRevision, translate } ) => (
	<div className="editor-revisions-list__header">
		<h3>
			{ translate( "You're seeing a past revision" ) }
		</h3>
		<Button
			className="editor-revisions-list__load-revision"
			onClick={ loadRevision }
			compact={ true }
		>
			{ translate( 'Load revision in the editor' ) }
		</Button>
	</div>
);

EditorRevisionsListHeader.propTypes = {
	loadRevision: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListHeader );
