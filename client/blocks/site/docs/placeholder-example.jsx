/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import SitePlaceholder from 'client/blocks/site/placeholder';

export default class SitePlaceholderExample extends PureComponent {
	static displayName = 'SitePlaceholderExample';

	render() {
		return <SitePlaceholder />;
	}
}
