/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { BaseControl } from '@wordpress/components';

BaseControl.displayName = 'BaseControl';

export default class extends React.Component {
	static displayName = 'BaseControl';

	static defaultProps = {
		exampleCode: (
			<BaseControl
				id="textarea-1"
				label="Text"
				help="Enter some text"
			>
				<textarea
					id="textarea-1"
				/>
			</BaseControl>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
