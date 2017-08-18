/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import ColorSchemePicker from 'blocks/color-scheme-picker';

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

				{ this.state.selectedColorScheme &&
					<Notice
						text={ `Selected color scheme: ${ this.state.selectedColorScheme }` }
						showDismiss={ false }
					/> }
			</Card>
		);
	}
}

export default ColorSchemePickerExample;
