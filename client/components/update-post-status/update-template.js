/** @format */

/**
 * External dependencies
 */

import React from 'react';

const Ellipsis = () => (
	<span>
		<span className="loading-dot">.</span>
		<span className="loading-dot">.</span>
		<span className="loading-dot">.</span>
	</span>
);

export default function UpdateTemplate( {
	post,
	previousStatus,
	resetToPreviousState,
	status,
	strings: s,
} ) {
	let updateClass = 'conf-alert';
	let updateText, undoTemplate, undoClick, trashText;

	switch ( status ) {
		case 'trashing':
		case 'deleting':
			trashText = status === 'deleting' ? s.deleting : s.trashing;
			updateText = (
				<span>
					{ trashText } <Ellipsis />
				</span>
			);
			updateClass += ' conf-alert--trashing';
			break;

		case 'trash':
			undoClick = resetToPreviousState;
			undoTemplate = (
				<a className="undo" onClick={ undoClick }>
					<span>{ s.undo }</span>
				</a>
			);
			updateText = s.trashed;
			updateClass += ' conf-alert--trashed';
			break;

		case 'deleted':
			updateText = s.deleted;
			updateClass += ' conf-alert--deleted';
			break;

		case 'updating':
			updateText = (
				<span>
					{ s.updating } <Ellipsis />
				</span>
			);
			updateClass += ' conf-alert--updating';
			break;

		case 'error':
			updateText = s.error;
			updateClass += ' conf-alert--error';
			break;

		case 'restoring':
			updateText = (
				<span>
					{ s.restoring } <Ellipsis />
				</span>
			);
			updateClass += ' conf-alert--updating';
			break;

		default:
			updateText = previousStatus === 'trash' ? s.restored : s.updated;
	}

	return (
		<div key={ post.global_ID + '-update' } className="updated-confirmation">
			<div className={ updateClass }>
				<div className="conf-alert_con">
					<span className="conf-alert_title">{ updateText }</span>
					{ undoTemplate }
				</div>
			</div>
		</div>
	);
}
