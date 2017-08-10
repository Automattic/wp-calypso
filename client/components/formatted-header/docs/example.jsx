/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

export default class FormattedHeaderExample extends PureComponent {
	static displayName = 'FormattedHeaderExample';

	render() {
		return (
			<FormattedHeader
				headerText="This is the header."
				subHeaderText="This is the optional subheader."
			/>
		);
	}
}
