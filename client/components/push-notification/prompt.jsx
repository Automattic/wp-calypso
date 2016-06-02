/**
 * External dependencies
 */
import React from 'react';
import store from 'store';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import Button from 'components/button';
import observe from 'lib/mixins/data-observe';

const SECTION_NAME_WHITELIST = [
	'discover',
	'menus',
	'people',
	'plans',
	'plugins',
	'posts-pages',
	'reader',
	'reader-activities',
	'reader-list',
	'reader-recomendations',
	'reader-search',
	'reader-tags',
	'settings',
	'sharing',
	'stats',
	'upgrades'
];

export default React.createClass( {
	displayName: 'PushNotificationPrompt',

	mixins: [ observe( 'pushNotifications', 'user' ) ],

	propTypes: {
		user: React.PropTypes.object,
		section: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		isLoading: React.PropTypes.bool,
		pushNotifications: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			dismissed: store.get( 'push-notification-notice-dismissed' ),
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
		store.set( 'push-notification-notice-dismissed', true );
		this.setState( { dismissed: true } );
	},

	pushUnsubscribedNotice: function() {
		const noticeText = (
			<div>
				<p>
					<strong>{ this.translate( 'Get notifications on your desktop!' ) }</strong> { this.translate( 'Instantly see your likes, comments, and more—even when you don\'t have WordPress.com open in your browser.' ) }
				</p>
				<p>
					{ this.translate(
						'{{enableButton}}Enable Browser Notifications{{/enableButton}}', {
							components: {
								enableButton: <Button className={ 'push-notification__prompt-enable' } onClick={ this.subscribe } />
							} }
					) }
				</p>
			</div>
		);

		return <Notice className="push-notification__notice" text={ noticeText } icon="bell" onDismissClick={ this.dismissNotice } />;
	},

	render: function() {
		const pushNotifications = this.props.pushNotifications,
			user = this.props.user.get();

		if ( ! user || ! user.email_verified || this.state.dismissed || this.state.subscribed ) {
			return null;
		}

		if ( ! this.props.section || this.props.isLoading || -1 === SECTION_NAME_WHITELIST.indexOf( this.props.section.name ) ) {
			return null;
		}

		switch ( pushNotifications.state ) {
			case 'unknown':
			case 'subscribed':
			case 'denied':
				return null;
			case 'unsubscribed':
				return this.pushUnsubscribedNotice();
			default:
				return null;
		}
	}
} );
