/**
 * External dependencies
 */

import React, { Fragment, PureComponent } from 'react';

/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';

export default class FormattedHeaderExample extends PureComponent {
	static displayName = 'FormattedHeaderExample';

	render() {
		return (
			<Fragment>
				<FormattedHeader
					headerText="This is the header."
					subHeaderText="This is the optional subheader."
				/>
				<FormattedHeader
					headerText="This is the compact on mobile header."
					subHeaderText="This is the optional subheader."
					compactOnMobile
				/>
			</Fragment>
		);
	}
}
