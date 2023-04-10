import React from 'react';

class HelloWorldStep extends React.Component {
	handleSubmit = ( event ) => {
		event.preventDefault();

		// Submit the current step's data to the backend.
		// This is required for the step to be marked as completed.
		this.props.submitSignupStep( { stepName: this.props.stepName } );

		// Move on to the next step in the signup flow
		this.props.goToNextStep();
	};

	render() {
		return (
			<div>
				<h2>Hello, world!</h2>
				<p>This is the first step in the signup process.</p>
				<p>You can add your own content here to introduce the user to the signup flow.</p>

				<form onSubmit={ this.handleSubmit }>
					<p>This is the step named { this.props.stepName }</p>
					<button className="button" type="submit">
						Get started
					</button>
				</form>
			</div>
		);
	}
}

export default HelloWorldStep;
