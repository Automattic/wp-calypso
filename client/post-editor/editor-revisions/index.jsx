/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

function EditorRevisions( { adminUrl, revisions = [], translate } ) {
	if ( ! revisions || ! revisions.length ) {
		return null;
	}

	const lastRevision = revisions[ 0 ];
	const revisionsLink = adminUrl + 'revision.php?revision=' + lastRevision;
	return (
		<a
			className="editor-revisions"
			href={ revisionsLink }
			target="_blank"
			rel="noopener noreferrer"
			aria-label={ translate( 'Open list of revisions' ) }
		>
			<Gridicon icon="history" size={ 18 } />
			{ translate(
				'%(revisions)d revision',
				'%(revisions)d revisions', {
					count: revisions.length,
					args: { revisions: revisions.length },
				}
			) }
		</a>
	);
}

EditorRevisions.propTypes = {
	adminUrl: PropTypes.string,
	revisions: PropTypes.array,
	translate: PropTypes.func,
};

export default localize( EditorRevisions );
