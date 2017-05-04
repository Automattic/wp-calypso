/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { partial } from 'lodash';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { CHILD_SIDEBAR_REVISIONS } from '../editor-sidebar/util';

function EditorRevisions( { revisions = [], translate, toggleChildSidebar } ) {
	if ( ! revisions || ! revisions.length ) {
		return null;
	}

	return (
		<button
			className="editor-revisions"
			title={ translate( 'Open list of revisions' ) }
			onClick={ partial( toggleChildSidebar, CHILD_SIDEBAR_REVISIONS ) }
		>
			<Gridicon icon="history" size={ 18 } />
			{ translate(
				'%(revisions)d revision',
				'%(revisions)d revisions', {
					count: revisions.length,
					args: {
						revisions: revisions.length,
					},
				}
			) }
		</button>
	);
}

EditorRevisions.propTypes = {
	revisions: PropTypes.array,
	translate: PropTypes.func,
	toggleChildSidebar: PropTypes.func,
};

export default localize( EditorRevisions );
