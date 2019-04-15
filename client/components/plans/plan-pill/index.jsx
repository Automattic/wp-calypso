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
		{ props.children }
	</div>
);
