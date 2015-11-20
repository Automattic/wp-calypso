
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	joinClasses = require( 'react/lib/joinClasses' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'LoggedOutForm',

	render: function() {
		var classes = classNames( { 'logged-out-form': true, } );

		return (
			<div className={ joinClasses( this.props.className, classes ) } >
				<Card>
					<form onSubmit={ this.props.onSubmit } noValidate={ true }>
						{ this.props.formHeader &&
							<header className="logged-out-form__header">
								{ this.props.formHeader }
							</header>
						}
						{ this.props.formFields }
						<footer className="logged-out-form__footer">
							{ this.props.formFooter }
						</footer>
					</form>
				</Card>
				{ this.props.footerLink }
			</div>
		);
	}
} );
