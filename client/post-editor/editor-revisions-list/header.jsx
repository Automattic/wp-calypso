/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RevisionsCounter from './revisions-counter';

// TODO: don't pass numRevisions, connect it in revisions counter.
const EditorRevisionsListHeader = ( { numRevisions, translate } ) => {
	return (
		<div className="editor-revisions-list__header">
			{ !! numRevisions && (
				<span
					style={ {
						flex: '1 0 0',
						marginLeft: '16px',
					} }
				>
					{ translate( 'History' ) }
				</span>
			) }
			{ !! numRevisions && <RevisionsCounter count={ numRevisions } /> }
		</div>
	);
};

EditorRevisionsListHeader.propTypes = {
	numRevisions: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
