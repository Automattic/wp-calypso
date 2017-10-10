// Testing React.Component usage

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

export default localize( class extends React.Component {
	static displayName = 'SomeDisplayName';

	render() {
		return <div />;
	}
} );
