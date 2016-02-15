/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:signup:wpcom-login' );

/**
 * Internal dependencies
 */
var config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'WpcomLoginForm',

	componentDidMount: function() {
		debug( 'submit form' );
		this.refs.wpcomLoginForm.submit();
	},

	action: function() {
		var subdomainRegExp = /^https?:\/\/([a-z0-9]*).wordpress.com/,
			subdomain = '';

		if ( subdomainRegExp.test( this.props.redirectTo ) &&
			config( 'hostname' ) !== 'wpcalypso.wordpress.com' &&
			config( 'hostname' ) !== 'horizon.wordpress.com' ) {
			subdomain = this.props.redirectTo.match( subdomainRegExp )[ 1 ] + '.';
		}

		return 'https://' + subdomain + 'wordpress.com/wp-login.php';
	},

	render: function() {
		return (
			<form method="post" action={ this.action() } ref="wpcomLoginForm">
				<input type="hidden" name="log" value={ this.props.log } />
				<input type="hidden" name="pwd" value={ this.props.pwd } />
				<input type="hidden" name="authorization" value={ this.props.authorization } />
				<input type="hidden" name="redirect_to" value={ this.props.redirectTo } />
			</form>
		);
	}
} );
