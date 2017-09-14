/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Version from 'components/version';

export default class extends PureComponent {
	static displayName = 'Version';

	render() {
		return (
			<div>
				<Version icon="my-sites" version={ 4.4 } />
				<Version icon="plugins" version={ 3.8 } />
			</div>
		);
	}
}
