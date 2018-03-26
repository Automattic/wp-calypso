/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';

const BadgeExample = () => (
	<div>
		<div className="docs__design-badge-row">
			<Badge type="success">Success Badge</Badge>
		</div>
		<div className="docs__design-badge-row">
			<Badge type="warning">Warning Badge</Badge>
		</div>
	</div>
);

BadgeExample.displayName = 'Badge';

export default BadgeExample;
