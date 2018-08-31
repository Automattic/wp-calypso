/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

import styles from './style.scss';

export default props => (
	<div className={ classNames( styles.ribbon, { [ styles.isGreen ]: props.color === 'green' } ) }>
		<span className={ styles.title }>{ props.children }</span>
	</div>
);
