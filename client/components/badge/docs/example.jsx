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
			<Badge type="info">Info Badge</Badge>
			<Badge type="success">Success Badge</Badge>
			<Badge type="warning">Warning Badge</Badge>
		</div>
	),
};

export default BadgeExample;
