import classNames from 'classnames';
import React from 'react';
import './content.scss';

export default ( { children, className } ) => (
	<div className={ classNames( 'editor-media-modal__content', className ) }>{ children }</div>
);
