import classNames from 'classnames';
import PropTypes from 'prop-types';

const ActionPanelFigure = ( { inlineBodyText = false, align, children } ) => {
	const figureClasses = classNames( {
		'action-panel__figure': true,
		[ `align-${ 'left' === align ? 'left' : 'right' }` ]: true,
		'is-inline-body-text': inlineBodyText,
	} );

	return <div className={ figureClasses }>{ children }</div>;
};

ActionPanelFigure.propTypes = {
	inlineBodyText: PropTypes.bool, // above `480px` does figure align with body text (below title)
};

export default ActionPanelFigure;
