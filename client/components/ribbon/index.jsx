/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

import './style.scss';

export default props => (
	<div
		className={ classNames( {
			ribbon: true,
			'is-green': props.color === 'green',
		} ) }
	>
		<span className="ribbon__title">{ props.children }</span>
	</div>
);
