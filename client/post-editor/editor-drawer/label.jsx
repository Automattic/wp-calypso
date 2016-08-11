/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';

export default function EditorDrawerLabel( { children, labelText, helpText } ) {
	return (
		<label className="editor-drawer__label">
			<span className="editor-drawer__label-text">
				{ labelText }
				{ helpText && <InfoPopover position="top left">{ helpText }</InfoPopover> }
				{ children }
			</span>
		</label>
	);
}

EditorDrawerLabel.propTypes = {
	children: PropTypes.node,
	helpText: PropTypes.string,
	labelText: PropTypes.string
};
