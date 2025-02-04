import clsx from 'clsx';

const ActionPanelFigureHeader = ( { children, className } ) => {
	return <h3 className={ clsx( 'action-panel__figure-header', className ) }>{ children }</h3>;
};

export default ActionPanelFigureHeader;
