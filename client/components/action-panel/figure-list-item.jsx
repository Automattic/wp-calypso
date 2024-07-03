import clsx from 'clsx';

const ActionPanelFigureListItem = ( { children, className } ) => {
	return <li className={ clsx( 'action-panel__figure-list-item', className ) }>{ children }</li>;
};

export default ActionPanelFigureListItem;
