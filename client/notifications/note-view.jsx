import React from 'react';
import {
	path
} from 'ramda';

import parseBlocks, { addKey } from './blocks/block-tree-parser';

const NoteView = React.createClass( {
	render() {
		const {
			note
		} = this.props;

		const header = parseBlocks( note.header );
		const headerExcerpt = path( [ 'headerExcerpt', 'text' ], note );
		const subject = parseBlocks( note.subject );
		const subjectExcerpt = path( [ 'subjectExcerpt', 'text' ], note );
		const body = note.body.map( parseBlocks );

		return (
			<div className="notifications__note-view">
				<div className="notifications__note-header">{ header }</div>
				{ headerExcerpt &&
				<div className="notifications__note-header notifications__note-excerpt">{ headerExcerpt }</div> }
				<div className="notifications__note-subject">{ subject }</div>
				{ subjectExcerpt &&
				<div className="notifications__note-subject notifications__note-excerpt">{ subjectExcerpt }</div> }
				<div>
					{ body.map( addKey ) }
				</div>
			</div>
		);
	}
} );

export default NoteView;
