/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './content.scss';

export default ( { children, className } ) => (
	<div className={ classNames( 'editor-media-modal__content', className ) }>{ children }</div>
);
