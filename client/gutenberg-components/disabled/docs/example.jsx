/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Button, Disabled } from '@wordpress/components';

Disabled.displayName = 'Disabled';

export default class extends React.Component {
	static displayName = 'Disabled';

	static defaultProps = {
		exampleCode: (
			<Disabled>
				<Button isPrimary>Disabled button</Button>
			</Disabled>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
