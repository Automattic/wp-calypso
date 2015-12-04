
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var LoggedoutFormContainer = require( 'components/logged-out-form-container' ),
	LoggedoutFormContainerFooter = require( 'components/logged-out-form-container/footer' ),
	LoggedoutFormContainerForm = require( 'components/logged-out-form-container/form' );

module.exports = React.createClass( {
	displayName: 'LoggedOutForm',

	render: function() {
		return (
			<LoggedoutFormContainer>
				<LoggedoutFormContainerForm onSubmit={ this.props.onSubmit } noValidate={ true }>
					{ this.props.formHeader &&
						<header className="logged-out-form__header">
							{ this.props.formHeader }
						</header>
					}
					{ this.props.formFields }
				</LoggedoutFormContainerForm>

				<LoggedoutFormContainerFooter>
					{ this.props.formFooter }
				</LoggedoutFormContainerFooter>

				{ this.props.footerLink }
			</LoggedoutFormContainer>
		);
	}
} );
