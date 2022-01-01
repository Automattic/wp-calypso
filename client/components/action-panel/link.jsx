import classnames from 'classnames';

const ActionPanelLink = ( { children = undefined, href, className = '' } ) => {
	return (
		<a href={ href } className={ classnames( 'action-panel__body-text-link', className ) }>
			{ children }
		</a>
	);
};

export default ActionPanelLink;
