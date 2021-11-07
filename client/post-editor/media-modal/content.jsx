import classNames from 'classnames';
import './content.scss';

export default ( { children, className } ) => (
	<div className={ classNames( 'editor-media-modal__content', className ) }>{ children }</div>
);
