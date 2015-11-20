/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	sites = require( 'lib/sites-list' )(),
	Notice = require( 'notices/notice' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	emailVerification = require( 'components/email-verification' );

module.exports = React.createClass( {
	displayName: 'EmailVerification',

	getInitialState: function() {
		return {
			activeNotice: undefined,
			dismissed: false,
			emailSent: false,
			pendingRequest: false,
			error: null
		};
	},

	componentWillMount: function() {
		emailVerification.on( 'change', this.setActiveNotice );
		this.props.user.on( 'change', this.setActiveNotice );
	},

	componentWillUnmount: function() {
		this.unsubscribeFromStores();
	},

	unsubscribeFromStores: function() {
		emailVerification.off( 'change', this.setActiveNotice );
		this.props.user.off( 'change', this.setActiveNotice );
	},

	setActiveNotice: function() {
		var user = this.props.user;

		if ( user.fetching ) {
			// wait until the user is fetched to set a notice
			return;
		}

		if ( emailVerification.showUnverifiedNotice && user.get() && ! user.get().email_verified ) {
			return this.setState( { activeNotice: 'UNVERIFIED' } );
		}

		if ( emailVerification.showVerifiedNotice ) {
			return this.setState( { activeNotice: 'VERIFIED' } );
		}

		if ( user.get().email_verified ) {
			this.unsubscribeFromStores();
			return this.setState( { activeNotice: undefined } );
		}
	},

	sendVerificationEmail: function() {
		if ( this.state.pendingRequest ) {
			return;
		}

		this.setState( { pendingRequest: true } );

		this.props.user.sendVerificationEmail( function( error, response ) {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false
			}, this.showEmailSentSuccessMessage );
		}.bind( this ) );
	},

	showEmailSentSuccessMessage: function() {
		var user, noticeText;
		if ( this.state.emailSent ) {
			user = this.props.user.get();
			noticeText = this.translate(
				'We sent another confirmation email to {{email /}}',
				{ components: { email: user.email } }
			);
			notices.success( noticeText );
		}
	},

	handleChangeEmail: function() {
		page( '/me/account' );
	},

	dismissNotice: function() {
		this.setState( { dismissed: true } );
	},

	unverifiedNotice: function() {
		var user = this.props.user.get(),
			noticeText,
			noticeStatus;

		if ( this.state.error ) {
			noticeText = this.state.error.message;
			noticeStatus = 'is-error';
		} else {
			noticeText = ( <div>
				<p>
					<strong>{ this.translate( 'Please verify your email address' ) }</strong>
				</p>
				<p>
					{ this.translate(
						'To post and keep using WordPress.com you need to validate your email address. ' +
						'Please click the link in the email we sent at %(email)s.',
						{ args: { email: user.email } }
					) }
				</p>
				<p>
					{ this.translate(
						'{{requestButton}}Re-send your activation email{{/requestButton}} ' +
						'or {{changeButton}}change the email address on your account{{/changeButton}}.', {
						components: {
							requestButton: <button className="button is-link" onClick={ this.sendVerificationEmail } />,
							changeButton: <button className="button is-link" onClick={ this.handleChangeEmail } />
						} }
					) }
				</p>
			</div> );
		}

		return <Notice text={ noticeText } status={ noticeStatus } showDismiss={ false } className={ 'is-email-verification' } />;
	},

	verifiedNotice: function() {
		var noticeText = isEmpty( sites.get() ) ?
			this.translate( "You've successfully verified your email address." ) :
			this.translate( "Email verified! Now that you've confirmed your email address you can publish posts on your blog." );

		return <SimpleNotice status="is-success" onClick={ this.dismissNotice }>{ noticeText }</SimpleNotice>;
	},

	render: function() {
		var user = this.props.user.get();

		if ( ! user || this.state.emailSent || this.state.dismissed || ! this.state.activeNotice ) {
			return null;
		}

		if ( 'UNVERIFIED' === this.state.activeNotice && ! user.email_verified ) {
			return this.unverifiedNotice();
		}

		if ( 'VERIFIED' === this.state.activeNotice ) {
			return this.verifiedNotice();
		}

		return null;
	}
} );
