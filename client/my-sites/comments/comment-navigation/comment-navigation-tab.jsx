import clsx from 'clsx';

export const CommentNavigationTab = ( { children, className } ) => (
	<div className={ clsx( 'comment-navigation__tab', className ) }>{ children }</div>
);

export default CommentNavigationTab;
