import clsx from 'clsx';
import './content.scss';

export default ( { children, className } ) => (
	<div className={ clsx( 'editor-media-modal__content', className ) }>{ children }</div>
);
