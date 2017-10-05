/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-initial-setup' );

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import analytics from 'lib/analytics';

module.exports = React.createClass( {

	displayName: 'Security2faInitialSetup',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	propTypes: {
		onSuccess: PropTypes.func.isRequired,
	},

	render: function() {
		return (
				<div>
					<p>
						{ this.translate( 'Two-Step Authentication adds an extra layer ' +
							'of security to your account. Once enabled, logging in to ' +
							'WordPress.com will require you to enter a unique passcode ' +
							'generated by an app on your mobile device or sent via text ' +
							'message, in addition to your username and password.' ) }
					</p>

					<FormButton onClick={ function( event ) {
						analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Get Started Button' );
						this.props.onSuccess( event );
					}.bind( this ) } >
						{ this.translate( 'Get Started' ) }
					</FormButton>
				</div>
		);
	}
} );
