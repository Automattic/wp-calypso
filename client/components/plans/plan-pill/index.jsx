/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default props => (
	<div
		className={ classNames( {
			'plan-pill': true,
		} ) }
	>
		{ props.children }
	</div>
);
