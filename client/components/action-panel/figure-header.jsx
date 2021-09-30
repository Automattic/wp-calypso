import classnames from 'classnames';

const ActionPanelFigureHeader = ( { children, className } ) => {
	return <h3 className={ classnames( 'action-panel__figure-header', className ) }>{ children }</h3>;
};

export default ActionPanelFigureHeader;
