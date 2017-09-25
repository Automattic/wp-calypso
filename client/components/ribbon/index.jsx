/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

export default props => <div className={ classNames( {
	ribbon: true,
	'is-green': props.color === 'green'
} ) }>
	<span className="ribbon__title">{ props.children }</span>
</div>;
