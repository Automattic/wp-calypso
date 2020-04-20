/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

const ActionPanelFigure = ( { inlineBodyText, align, children } ) => {
	const figureClasses = classNames( {
		'action-panel__figure': true,
		[ `align-${ 'left' === align ? 'left' : 'right'}` ]: true,
		'is-inline-body-text': inlineBodyText,
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
