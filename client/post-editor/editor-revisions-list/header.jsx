/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const EditorRevisionsListHeader = ( { numRevisions, translate } ) => {
	return (
		<div className="editor-revisions-list__header">
			{ !! numRevisions &&
				translate( '%(revisions)d revision', '%(revisions)d revisions', {
					count: numRevisions,
					args: { revisions: numRevisions },
				} ) }
		</div>
	);
};

EditorRevisionsListHeader.propTypes = {
	numRevisions: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
