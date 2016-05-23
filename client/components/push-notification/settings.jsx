/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';

const debug = debugFactory( 'calypso:push-notification-settings' );

module.exports = React.createClass( {
	displayName: 'PushNotificationSettings',

	mixins: [ observe( 'pushNotifications' ) ],

	propTypes: {
		pushNotifications: React.PropTypes.object
	},

	clickHandler: function() {
		debug( 'Handling click for state %s', this.props.pushNotifications.state );

		if ( 'subscribed' === this.props.pushNotifications.state ) {
			this.props.pushNotifications.unsubscribe();
		}

		if ( 'unsubscribed' === this.props.pushNotifications.state ) {
			this.props.pushNotifications.subscribe();
		}
	},

	render: function() {
		let buttonClass,
			buttonDisabled,
			buttonText,
			deniedText = null,
			stateClass,
			stateText;

		switch ( this.props.pushNotifications.state ) {
			case 'unsubscribed':
				buttonClass = { 'is-enable': true };
				buttonDisabled = false;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );
				break;
			case 'subscribed':
				buttonClass = { 'is-disable': true };
				buttonDisabled = false;
				buttonText = this.translate( 'Disable' );
				stateClass = { 'is-enabled': true };
				stateText = this.translate( 'Enabled' );
				break;
			case 'denied':
				buttonClass = { 'is-enable': true };
				buttonDisabled = true;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );

				deniedText = <Notice className="push-notifications__settings-instruction" showDismiss={ false } text={
					<div>
						<div>{ this.translate( 'Your browser is currently set to block notifications from WordPress.com.' ) }</div>
						<div>{ this.translate( 'View Instructions to Enable' ) }</div>
					</div>
				} />;
				break;
			case 'unknown':
				return null;
		}

		return (
			<div>
				<Card className="push-notification__settings-header" compact={ true }>
					<div className="push-notification__settings-label"><Gridicon size={ 24 } className="push-notification__settings-icon" icon="bell" />{ this.translate( 'Browser Notifications' ) }</div>
					<div className={ classNames( 'push-notification__settings-state', stateClass ) }>{ stateText }</div>
				</Card>
				<Card>
					<div className="push-notification__settings-body">
						<div className="push-notification__settings-label">
							<div className="push-notification__settings-description">{ this.translate( 'Get notifications for new comments, likes, and more instantly, even when your browser is closed.' ) }</div>
						</div>
						<div className="push-notification__settings-action"><button className={ classNames( 'button', buttonClass ) } disabled={ buttonDisabled } onClick={ this.clickHandler }>{ buttonText }</button></div>
					</div>
					{ deniedText }
				</Card>
			</div>
		);
	}
} );
