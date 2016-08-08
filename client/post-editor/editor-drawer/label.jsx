/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

export default function EditorDrawerLabel( { children } ) {
	return (
		<label className="editor-drawer__label">
			<span className="editor-drawer__label-text">
				{ children }
			</span>
		</label>
	);
}

EditorDrawerLabel.propTypes = {
	children: PropTypes.node
};
