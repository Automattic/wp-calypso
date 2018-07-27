/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { CheckboxControl } from '@wordpress/components';

CheckboxControl.displayName = 'CheckboxControl';

export default class extends React.Component {
	static displayName = 'CheckboxControl';

	static defaultProps = {
		exampleCode: (
			<CheckboxControl
				heading="User"
				label="Is author"
				help="Is the user a author or not?"
			/>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
