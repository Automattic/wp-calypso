import React from 'react';
import Gridicon from 'components/gridicon';
import {
	partial,
	path
} from 'ramda';
import moment from 'moment';

import Avatar from './avatar';
import parseBlocks from './blocks/block-tree-parser';

const NoteListView = React.createClass( {
	render() {
		const {
			note,
			selectNote
		} = this.props;

		const selectThisNote = partial( selectNote, [ note.id ] );

		const avatar = note.avatar;
		const hasReplied = note.hasReplied;
		const icon = note.icon;
		const subject = parseBlocks( note.subject );
		const subjectExcerpt = path( [ 'subjectExcerpt', 'text' ], note );
		const timestamp = moment( note.timestamp ).fromNow();

		return (
			<div className="notifications__list-view" onClick={ selectThisNote }>
				<div>
					<Avatar src={ avatar } />
					<Gridicon className="notifications__list-icon" { ...{ icon } } />
				</div>
				<div className="notifications__list-subject">
					{ hasReplied &&
					<Gridicon icon="reply" size={ 16 } /> }
					{ subject }
				</div>
				{ subjectExcerpt &&
				<div className="notifications__list-subject notifications__list-excerpt">{ subjectExcerpt }</div> }
				<div className="notifications__list-timestamp">{ timestamp }</div>
			</div>
		);
	}
} );

export default NoteListView;
