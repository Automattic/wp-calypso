/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';

const BadgeExample = () => this.props.exampleCode;

Badge.displayName = 'Badge';
BadgeExample.displayName = 'Badge';

BadgeExample.defaultProps = {
	exampleCode: (
		<div>
			<Badge type="info">Info Badge</Badge>
			<Badge type="success">Success Badge</Badge>
			<Badge type="warning">Warning Badge</Badge>
			<Badge type="info-blue">Info Blue Badge</Badge>
			<Badge type="error">Error Badge</Badge>
		</div>
	),
};

export default BadgeExample;
