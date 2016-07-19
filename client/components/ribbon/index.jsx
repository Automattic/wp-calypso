/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default props => <div className={ classNames( {
	ribbon__wrapper: true,
	'is-green': props.color === 'green'
} ) }>
	<span className="ribbon__title">{ props.children }</span>
</div>;
