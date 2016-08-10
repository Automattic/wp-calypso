import React from 'react';

import Gridicon from 'components/gridicon';
import NoteView from './note-view';

const SingleViewLayout = React.createClass( {
	render() {
		const {
			note,
			unselectNote
		} = this.props;

		const title = note.title;

		return (
			<div className="single-view-layout">
				<div className="title-bar">
					<a className="back-link" onClick={ unselectNote }>
						<Gridicon icon="chevron-left" /> Back
					</a>
					<div className="title">{ title }</div>
				</div>
				<NoteView { ...{ note } } />
			</div>
		);
	}
} );

export default SingleViewLayout;
