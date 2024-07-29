import clsx from 'clsx';

const ActionPanelLink = ( { children = undefined, href, className = '' } ) => {
	return (
		<a href={ href } className={ clsx( 'action-panel__body-text-link', className ) }>
			{ children }
		</a>
	);
};

export default ActionPanelLink;
