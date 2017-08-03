/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default props => <div className={ classNames( {
	ribbon: true,
	'is-green': props.color === 'green'
} ) }>
	<span className="ribbon__title">{ props.children }</span>
</div>;
