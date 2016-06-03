/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	Notice = require( 'components/notice' ),
	emailVerification = require( 'components/email-verification' ),
	user = require( 'lib/user' )(),
	userUtils = require( 'lib/user/utils' );

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
		user.on( 'change', this.setActiveNotice );
	},

	componentWillUnmount: function() {
		this.unsubscribeFromStores();
	},

	unsubscribeFromStores: function() {
		emailVerification.off( 'change', this.setActiveNotice );
		user.off( 'change', this.setActiveNotice );
	},

	setActiveNotice: function() {
		if ( user.fetching ) {
			// wait until the user is fetched to set a notice
			return;
		}

		if ( emailVerification.showUnverifiedNotice && userUtils.needsVerificationForSite( sites.getSelectedSite() ) ) {
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
			} );
		}.bind( this ) );
	},

	emailSentNotice: function() {
		var noticeText = this.translate(
				'We sent another confirmation email to %(email)s.',
				{ args: { email: user.email } }
			);

		return (
			<Notice
				text={ noticeText }
				status="is-success"
				onDismissClick={ this.dismissNotice }
				className="email-verification-notice" />
		);
	},

	handleChangeEmail: function() {
		page( '/me/account' );
	},

	dismissNotice: function() {
		this.setState( { dismissed: true } );
	},

	unverifiedNotice: function() {
		var noticeText,
			noticeStatus;

		if ( this.state.error ) {
			noticeText = this.state.error.message;
			noticeStatus = 'is-error';
		} else {
			noticeText = ( <div>
				<p>
					<strong>{ this.translate( 'Please confirm your email address' ) }</strong>
				</p>
				<p>
					{ this.translate(
						'To post and keep using WordPress.com you need to confirm your email address. ' +
						'Please click the link in the email we sent at %(email)s.',
						{ args: { email: user.get().email } }
					) }
				</p>
				<p>
					{ this.translate(
						'{{requestButton}}Re-send your confirmation email{{/requestButton}} ' +
						'or {{changeButton}}change the email address on your account{{/changeButton}}.', {
							components: {
								requestButton: <button className="button is-link" onClick={ this.sendVerificationEmail } />,
								changeButton: <button className="button is-link" onClick={ this.handleChangeEmail } />
							} }
					) }
				</p>
			</div> );
		}

		return <Notice text={ noticeText } icon="notice" status={ noticeStatus } onDismissClick={ this.dismissNotice } className="email-verification-notice" />;
	},

	verifiedNotice: function() {
		var noticeText = isEmpty( sites.get() )
			? this.translate( "You've successfully confirmed your email address." )
			: this.translate( "Email confirmed! Now that you've confirmed your email address you can publish posts on your blog." );

		return (
			<Notice status="is-success" onDismissClick={ this.dismissNotice } className="email-verification-notice">
				{ noticeText }
			</Notice>
		);
	},

	render: function() {
		if ( ! user || this.state.dismissed || ! this.state.activeNotice ) {
			return null;
		}

		if ( this.state.emailSent ) {
			return this.emailSentNotice();
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
