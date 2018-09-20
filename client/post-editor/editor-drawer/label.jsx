/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

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
			</span>
			{ children }
		</label>
	);
}

EditorDrawerLabel.propTypes = {
	helpText: PropTypes.string,
	labelText: PropTypes.string,
};
