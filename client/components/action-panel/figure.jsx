/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

const ActionPanelFigure = ( { inlineBodyText, align, children } ) => {
	const figureClasses = classNames( {
		'action-panel__figure': true,
		'is-inline-body-text': inlineBodyText,
		'is-aligned-left': 'left' === align,
	} );

	return <div className={ figureClasses }>{ children }</div>;
};

ActionPanelFigure.propTypes = {
	inlineBodyText: PropTypes.bool, // above `480px` does figure align with body text (below title)
};

ActionPanelFigure.defaultProps = {
	inlineBodyText: false,
};

export default ActionPanelFigure;
