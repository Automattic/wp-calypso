/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@wordpress/components';

Button.displayName = 'Button';

export default class extends React.Component {
	static displayName = 'Button';

	static defaultProps = {
		exampleCode: (
			<div className="docs__gutenberg-components-button">
				<Button isPrimary>Primary button</Button>
				<Button isDefault>Default button</Button>
				<Button isPrimary isLarge>
					Large primary button
				</Button>
				<Button isPrimary isSmall>
					Small primary button
				</Button>
				<Button isPrimary isBusy>
					Busy primary button
				</Button>
				<Button isLink href="https://wordpress.com" target="_blank">
					Link button
				</Button>
				<Button isLink isDestructive>
					Destructive link button
				</Button>
				<Button isPrimary disabled>
					Disabled primary button
				</Button>
				<Button isDefault disabled>
					Disabled default button
				</Button>
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
