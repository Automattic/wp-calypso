/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';

export default props => (
	<div
		className={ classNames( {
			'plan-pill': true,
		} ) }
	>
		<span className="plan-pill__title">{ props.children }</span>
	</div>
);
