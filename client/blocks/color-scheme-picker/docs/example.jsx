/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import ColorSchemePicker from 'client/blocks/color-scheme-picker';

class ColorSchemePickerExample extends PureComponent {
	static displayName = 'ColorSchemePicker';

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
