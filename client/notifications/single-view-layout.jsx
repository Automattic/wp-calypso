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
			<div className="notifications__single-view">
				<div className="notifications__title-bar">
					<a className="notifications__back-link" onClick={ unselectNote }>
						<Gridicon icon="chevron-left" /> Back
					</a>
					<div className="notifications__single-title">{ title }</div>
				</div>
				<NoteView { ...{ note } } />
			</div>
		);
	}
} );

export default SingleViewLayout;
