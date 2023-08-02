import classnames from 'classnames';

const ActionPanelBody = ( { children, className = '' } ) => {
	return <div className={ classnames( 'action-panel__body', className ) }>{ children }</div>;
};

export default ActionPanelBody;
