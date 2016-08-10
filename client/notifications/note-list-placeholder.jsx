import React from 'react';

const NoteListPlaceholder = () =>
	<div className="notifications__list-placeholder">
		<div className="notifications__list-avatar"></div>
		<div>
			<div className="notifications__list-subject"></div>
			<div className="notifications__list-excerpt"></div>
		</div>
	</div>;

NoteListPlaceholder.displayName = 'NoteListPlaceholder';

export default NoteListPlaceholder;
