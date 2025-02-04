import clsx from 'clsx';

const ActionPanelTitle = ( { children, className = '' } ) => {
	return <h2 className={ clsx( 'action-panel__title', className ) }>{ children }</h2>;
};

export default ActionPanelTitle;
