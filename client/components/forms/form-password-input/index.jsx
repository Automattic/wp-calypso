/**
 * External dependencies
 */
var React = require( 'react' ),
	Gridicon = require( 'gridicons' ),
	classNames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

/**
 * Internal dependencies
 */
var FormTextInput = require( 'components/forms/form-text-input' ),
	viewport = require( 'lib/viewport' );

module.exports = React.createClass( {

	displayName: 'FormPasswordInput',

	getInitialState: function() {
		var isMobile = viewport.isMobile();

		if ( isMobile ) {
			return { hidePassword: false };
		} else {
			return { hidePassword: true };
		}
	},

	togglePasswordVisibility: function() {
		this.setState( { hidePassword: ! this.state.hidePassword } );
	},

	hidden: function() {
		if ( this.props.hideToggle ) {
			return true;
		}
		return this.props.submitting || this.state.hidePassword;
	},

	focus: function() {
		this.refs.textField.focus();
	},

	render: function() {

		var toggleVisibilityClasses = classNames( {
			'form-password-input__toggle': true,
			'form-password-input__toggle-visibility': ! this.props.hideToggle
		} );

		return (
			<div className="form-password-input">
				<FormTextInput { ...omit( this.props, 'hideToggle', 'submitting' ) }
					autoComplete="off"
					ref="textField"
					type={ this.hidden() ? 'password' : 'text' } />

				<span className={ toggleVisibilityClasses } onClick={ this.togglePasswordVisibility }>
				{ this.hidden() ?
					<Gridicon icon="not-visible" />
				:
					<Gridicon icon="visible" />
				}
				</span>
			</div>
		);
	}
} );
