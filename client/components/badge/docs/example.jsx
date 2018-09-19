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

Badge.displayName = 'Badge';
BadgeExample.displayName = 'Badge';

BadgeExample.defaultProps = {
	exampleCode: (
		<div>
			<Badge type="success">Success Badge</Badge>
			<Badge type="warning">Warning Badge</Badge>
			<Badge type="success" size="small">
				Small success badge
			</Badge>
			<Badge type="warning" size="small">
				Small warning badge
			</Badge>
		</div>
	),
};

export default BadgeExample;
