import clsx from 'clsx';
import PropTypes from 'prop-types';

const ActionPanelFigure = ( { inlineBodyText = false, align = 'left', children } ) => {
	const figureClasses = clsx( 'action-panel__figure', {
		[ `align-${ 'left' === align ? 'left' : 'right' }` ]: true,
		'is-inline-body-text': inlineBodyText,
	} );

	return <div className={ figureClasses }>{ children }</div>;
};

ActionPanelFigure.propTypes = {
	inlineBodyText: PropTypes.bool, // above `480px` does figure align with body text (below title)
	align: PropTypes.string,
};

export default ActionPanelFigure;
