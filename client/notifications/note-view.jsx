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
			<div className="note-view">
				<div className="header">{ header }</div>
				{ headerExcerpt &&
				<div className="header excerpt">{ headerExcerpt }</div> }
				<div className="subject">{ subject }</div>
				{ subjectExcerpt &&
				<div className="subject excerpt">{ subjectExcerpt }</div> }
				<div>
					{ body.map( addKey ) }
				</div>
			</div>
		);
	}
} );

export default NoteView;
