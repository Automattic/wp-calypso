/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Button, ButtonGroup } from '@wordpress/components';

ButtonGroup.displayName = 'ButtonGroup';

export default class extends React.Component {
	static displayName = 'ButtonGroup';

	static defaultProps = {
		exampleCode: (
			<ButtonGroup>
				<Button isPrimary>Button 1</Button>
				<Button isPrimary>Button 2</Button>
			</ButtonGroup>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
