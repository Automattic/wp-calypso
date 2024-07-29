import clsx from 'clsx';

const ActionPanelFigureList = ( { children, className } ) => {
	return <ul className={ clsx( 'action-panel__figure-list', className ) }>{ children }</ul>;
};

export default ActionPanelFigureList;
