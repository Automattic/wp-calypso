/**
 * External dependencies
 */
import { map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';

function EditorRevisionsList() {
	const revisions = [
		{
			id: 10,
			date: 'April 17, 19:40',
			author: 'benoitperson',
			changes: [ 100, 10 ],
		},
	];

	return (
		<div>
			<EditorRevisionsListHeader />
			<ul className="editor-revisions-list__list">
				{ map( revisions, revision => (
					<li key={ revision.id }>
						<span className="editor-revisions-list__date">
							{ revision.date }
						</span>
						&nbsp;by&nbsp;
						<span className="editor-revisions-list__author">
							{ revision.author }
						</span>
						<br />
						<span className="editor-revisions-list__additions">
							{ revision.changes[ 0 ] } words added
						</span>
						&nbsp;
						<span className="editor-revisions-list__deletions">
							{ revision.changes[ 1 ] } words removed
						</span>
					</li>
				) ) }
			</ul>
		</div>
	);
}

export default EditorRevisionsList;
