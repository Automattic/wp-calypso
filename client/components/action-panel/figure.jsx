import clsx from 'clsx';
import PropTypes from 'prop-types';

const ActionPanelFigure = ( { inlineBodyText, align, children } ) => {
	const figureClasses = clsx( {
		'action-panel__figure': true,
		[ `align-${ 'left' === align ? 'left' : 'right' }` ]: true,
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
