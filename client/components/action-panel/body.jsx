import clsx from 'clsx';

const ActionPanelBody = ( { children, className = '' } ) => {
	return <div className={ clsx( 'action-panel__body', className ) }>{ children }</div>;
};

export default ActionPanelBody;
