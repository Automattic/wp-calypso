/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:push-notification-prompt' );

/**
 * Internal dependencies
 */
var Notice = require( 'components/notice' ),
	observe = require( 'lib/mixins/data-observe' );

module.exports = React.createClass( {
	displayName: 'PushNotificationPrompt',

	mixins: [ observe( 'pushNotifications', 'user' ) ],

	getInitialState: function() {
		return {
			dismissed: false,
			subscribed: false
		};
	},

	subscribe: function() {
		this.props.pushNotifications.subscribe( ( state ) => {
			if ( 'subscribed' === state ) {
				this.setState( { subscribed: true } );
			}
		} );
	},

	dismissNotice: function() {
		this.setState( { dismissed: true } );
	},

	pushDeniedNotice: function() {
		var noticeText = (
			<div>
				<p>
					<strong>Permission denied</strong>
				</p>
				<p>Instructions on how to enabled notifications?</p>
			</div>
		);

		return <Notice text={ noticeText } className="email-verification-notice" onDismissClick={ this.dismissNotice } />;
	},

	pushSubscribedNotice: function() {
		var noticeText = (
			<div>
				<p>
					<strong>Subscription Successful</strong>
				</p>
				<p>Instructions on where to go to manage the setting in the future?</p>
			</div>
		);

		return <Notice text={ noticeText } className="email-verification-notice" onDismissClick={ this.dismissNotice } />;
	},

	pushUnsubscribedNotice: function() {
		var noticeText = (
			<div>
				<p>
					<strong>{ this.translate( 'Don\'t miss out' ) }</strong>
				</p>
				<p>
					{ this.translate( 'Enable browser notifications to instantly receive notice of comments or likes on your posts.' ) }
				</p>
				<p>
					{ this.translate(
						'{{enableButton}}Turn on browser notifications{{/enableButton}}\xa0\xa0\xa0' +
						'{{dismissButton}}Not now{{/dismissButton}}', {
							components: {
								enableButton: <button className="button" onClick={ this.subscribe } />,
								dismissButton: <button className="button is-link" onClick={ this.dismissNotice } />
							} }
					) }
				</p>
			</div>
		);

		return <Notice text={ noticeText } className="email-verification-notice" onDismissClick={ this.dismissNotice } />;
	},

	render: function() {
		var pushNotifications = this.props.pushNotifications,
			user = this.props.user;

		if ( this.state.dismissed ) {
			return null;
		}

		if ( user.fetching || ( user.get() && ! user.get().email_verified ) ) {
			// Don't show the dialog until the user is fetched.
			// Don't show the dialog if the user hasn't verified their email address
			return null;
		}

		if ( this.state.subscribed ) {
			return this.pushSubscribedNotice();
		}

		if ( 'unknown' === pushNotifications.state || 'subscribed' === pushNotifications.state ) {
			return null;
		}

		if ( 'denied' === pushNotifications.state ) {
			return this.pushDeniedNotice();
		}

		if ( 'unsubscribed' === pushNotifications.state ) {
			return this.pushUnsubscribedNotice();
		}

		return null;
	}
} );
