Component Documentation Template
===

_Use this as a README.md template when documenting components. If you are creating a new component, you can copy and paste this entire document as a starting point. See the [Button documentation](../design/buttons) for a good example._

Write a short, high-level explanation of the component with a focus on what problem it solves in the interface. Do not include any technical information in this description.
Example:

> Buttons express what action will occur when the user clicks or taps it. Buttons are used to trigger an action, and they can be used for any type of action, including navigation.

## Usage

First, display a `jsx` code block to show an example of usage, including import statements and a React component.

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import WizardWithProgressBar from 'components/wizard-with-progress-bar';

export default class WizardWithProgressBarExample extends Component {

	static defaultProps = {
		numberOfSteps: PropTypes.number.isRequired,
	};

	state = {
		currentStep: 1
	}

	handleNextButtonClick = () => {
		this.setState( {
			currentStep: Math.min( this.props.numberOfSteps, this.state.currentStep + 1 ),
		} );
	};

	handlePreviousButtonClick = () => {
		this.setState( {
			currentStep: Math.max( 1, this.state.currentStep - 1 ),
		} );
	};

	render() {
		return (
			<div>
				<WizardWithProgressBar
					currentStep={ this.state.currentStep }
					nextButtonClick={ this.handleNextButtonClick }
					numberOfSteps={ this.props.numberOfSteps }
					previousButtonClick={ this.handlePreviousButtonClick }
				/>
			</div>
		);
	}
}
```

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings.

**Required props are marked with `*`.**

Name | Type | Default | Description
--- | --- | --- | ---
`currentStep` * | `number` | `none` | The current step the wizard is on
`nextButtonClick`  | `func` | `noop` | Handler for the next button
`nextButtonText` | `string` | `none` | The text to display on the next button
`numberOfSteps` * | `number` | `none` | The total number of steps of the wizard
`previousButtonClick`  | `func` | `noop` | Handler for the previous button
`previousButtonText` | `string` | `none` | The text to display on the previous button

### Additional usage information

If the component has many states, or if a technical aspect needs more explanation, use this section. Example:

* **Button Handlers**: Should generally to check if the Wizard can proceed, then update the `currentStep` property.
