/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const EditorRevisionsListHeader = ( { loadRevision, selectedRevisionId, translate } ) => (
	<div className="editor-revisions-list__header">
		<Button
			compact
			className="editor-revisions-list__load-revision"
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
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
