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

	renderExtraFields: function() {
		const { extraFields } = this.props;

		if ( ! extraFields ) {
			return null;
		}

		return (
			<div>
				{ Object.keys( extraFields ).map( function( field ) {
					return <input key={ field } type="hidden" name={ field } value={ extraFields[ field ] } />;
				} ) }
			</div>
		);
	},

	getFormTarget() {
		return this.props.silentSubmit ? 'login-hidden-iframe-target' : '_self';
	},

	getTargetIFrame() {
		return this.props.silentSubmit
			? (
				<iframe
					name="login-hidden-iframe-target"
					style={ { display: 'none' } }
				/>
			)
			: null;
	},

	render: function() {
		return (
			<div>
				<form
					method="post"
					action={ this.action() }
					ref="wpcomLoginForm"
					target={ this.getFormTarget() }
				>
					<input type="hidden" name="log" value={ this.props.log } />
					<input type="hidden" name="pwd" value={ this.props.pwd } />
					<input type="hidden" name="authorization" value={ this.props.authorization } />
					<input type="hidden" name="redirect_to" value={ this.props.redirectTo } />
					{ this.renderExtraFields() }
				</form>
				{ this.getTargetIFrame() }
			</div>
		);
	}
} );
