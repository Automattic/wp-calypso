/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';

const BadgeExample = () => this.props.exampleCode;

BadgeExample.displayName = 'Badge';

BadgeExample.defaultProps = {
	exampleCode: (
		<div>
			<Badge type="success">Success Badge</Badge>
			<Badge type="warning">Warning Badge</Badge>
		</div>
	),
};

export default BadgeExample;
