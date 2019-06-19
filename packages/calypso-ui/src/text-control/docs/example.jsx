/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { TextControl } from '@automattic/calypso-ui';

export default class extends PureComponent {
	static displayName = 'TextControl';

	state = {
		inputTextValue1: 'Input value',
		inputTextValue2: '',
		inputNumValue: 0,
	};

	render() {
		const { inputTextValue1, inputTextValue2, inputNumValue } = this.state;
		return (
			<div>
				<TextControl
					label={ 'Text input with value' }
					value={ inputTextValue1 }
					onChange={ value => this.setState( { inputTextValue1: value } ) }
				/>
				<TextControl
					label={ 'Text Input empty' }
					value={ inputTextValue2 }
					onChange={ value => this.setState( { inputTextValue2: value } ) }
				/>
				<TextControl
					type="number"
					label={ 'Number Input' }
					value={ inputNumValue }
					onChange={ value => this.setState( { inputNumValue: value } ) }
				/>
				<TextControl label={ 'Text Input disabled' } disabled />
			</div>
		);
	}
}
