// Testing destructured PureComponent usage, with arbitrary args and arbitrary HoC name.

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize as somethingElse } from 'i18n-calypso';

export default somethingElse( 1000, 'xx', class extends PureComponent {
	static displayName = 'SomeDisplayName';

	render() {
		return <div />;
	}
} );
