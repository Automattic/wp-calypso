/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const ActionPanelFigure = ( { inlineBodyText, children } ) => {
	const figureClasses = classNames( {
		'settings-action-panel__figure': true,
		'is-inline-body-text': inlineBodyText
	} );

	return (
		<div className={ figureClasses }>
			{ children }
		</div>
	);
};

ActionPanelFigure.propTypes = {
	inlineBodyText: PropTypes.bool // above `480px` does figure align with body text (below title)
};

ActionPanelFigure.defaultProps = {
	inlineBodyText: false
};

export default ActionPanelFigure;
