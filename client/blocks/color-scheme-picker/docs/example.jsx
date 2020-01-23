/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ColorSchemePicker from 'blocks/color-scheme-picker';

class ColorSchemePickerExample extends PureComponent {
	state = {
		selectedColorScheme: null,
	};

	handleColorSchemeSelection = colorScheme => {
		this.setState( { selectedColorScheme: colorScheme } );
	};

	render() {
		return (
			<Card>
				<ColorSchemePicker temporarySelection onSelection={ this.handleColorSchemeSelection } />
			</Card>
		);
	}
}

export default ColorSchemePickerExample;
