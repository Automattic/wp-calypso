# Wizard Progress Bar

A Progress Bar for use with a custom wizard. It has buttons to go backward and forward through the steps of the wizard and will display the progress. This Component is unrelated to the `Wizard` Component.

## Usage

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import WizardProgressBar from 'calypso/components/wizard-progress-bar';

export default class WizardProgressBarExample extends Component {
	static defaultProps = {
		numberOfSteps: PropTypes.number.isRequired,
	};

	state = {
		currentStep: 1,
	};

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
				<WizardProgressBar
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

**Required props are marked with `*`.**

| Name                  | Type     | Default | Description                                |
| --------------------- | -------- | ------- | ------------------------------------------ |
| `currentStep`\*       | `number` | `none`  | The current step the wizard is on          |
| `nextButtonClick`     | `func`   | `noop`  | Handler for the next button                |
| `nextButtonText`      | `string` | `none`  | The text to display on the next button     |
| `numberOfSteps`\*     | `number` | `none`  | The total number of steps of the wizard    |
| `previousButtonClick` | `func`   | `noop`  | Handler for the previous button            |
| `previousButtonText`  | `string` | `none`  | The text to display on the previous button |

### Additional usage information

- **Button Handlers**: Should generally to check if the Wizard can proceed, then update the `currentStep` property.
