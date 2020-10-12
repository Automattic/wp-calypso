/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';

/**
 * Style dependencies
 */
import './label.scss';

export default function EditorDrawerLabel( { children, labelText, helpText } ) {
	return (
		<FormLabel className="editor-drawer__label">
			<span className="editor-drawer__label-text">
				{ labelText }
				{ helpText && <InfoPopover position="top left">{ helpText }</InfoPopover> }
			</span>
			{ children }
		</FormLabel>
	);
}

EditorDrawerLabel.propTypes = {
	helpText: PropTypes.string,
	labelText: PropTypes.string,
};
