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
import Button from 'components/button';
import Dialog from 'components/dialog';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';

const debug = debugFactory( 'calypso:push-notification-settings' );

export default  React.createClass( {
	displayName: 'PushNotificationSettings',

	mixins: [ observe( 'pushNotifications' ) ],

	propTypes: {
		pushNotifications: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			showDialog: false
		};
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

	getBlockedInstruction: function() {
		return (
			<Dialog isVisible={ this.state.showDialog } className="push-notification-instruction__dialog" onClose={ this._onCloseDialog }>
				<div className="push-notification-instruction__content">
					<div>
						<div className="push-notification-instruction__title">{ this.translate( 'Enable Browser Notifications' ) }</div>
						<div className="push-notification-instruction__step">
							<img height="180px" width="180px" src="/calypso/images/push-notifications/address-bar.svg" />
							<p>{ this.translate( 'Click the lock icon in your address bar.' ) }</p>
						</div>
						<div className="push-notification-instruction__step">
							<img height="180px" width="180px" src="/calypso/images/push-notifications/always-allow.svg" />
							<p>{ this.translate(
								'Click {{strong}}Notifications{{/strong}} and choose {{em}}Always allow{{/em}}.', {
									components: {
										strong: <strong />,
										em: <em />
									} }
							) }</p>
						</div>
					</div>
				</div>
				<span tabIndex="0" className="push-notification-instruction__dismiss" onClick={ this._onCloseDialog } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
			</Dialog>
		);
	},

	_onShowDialog: function() {
		this.setState( { showDialog: true } );
	},

	_onCloseDialog: function() {
		this.setState( { showDialog: false } );
	},

	render: function() {
		let blockedInstruction,
			buttonClass,
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
				blockedInstruction = this.getBlockedInstruction();
				buttonClass = { 'is-enable': true };
				buttonDisabled = true;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );

				deniedText = <Notice className="push-notifications__settings-instruction" showDismiss={ false } text={
					<div>
						<div>{ this.translate( 'Your browser is currently set to block notifications from WordPress.com.' ) }</div>
						<div>{ this.translate(
							'{{instructionsButton}}View Instructions to Enable{{/instructionsButton}}', {
								components: {
									instructionsButton: <Button className={ 'is-link' } onClick={ this._onShowDialog } />
								} }
						) }</div>
						{ blockedInstruction }
					</div>
				} />;
				break;
			case 'unknown':
				return null;
		}

		return (
			<div>
				<Card className="push-notification__settings">
					<h2 className="push-notification__settings-heading">
						<Gridicon size={ 24 } className="push-notification__settings-icon" icon="bell" />
						{ this.translate( 'Browser Notifications' ) }
						<small className={ classNames( 'push-notification__settings-state', stateClass ) }>{ stateText }</small>
					</h2>

					<p className="push-notification__settings-description">{ this.translate( 'Get notifications for new comments, likes, and more instantly, even when your browser is closed.' ) }</p>

					<Button className={ classNames( 'push-notification__settings-button', buttonClass ) } disabled={ buttonDisabled } onClick={ this.clickHandler } >{ buttonText }</Button>

					{ deniedText }
				</Card>
			</div>
		);
	}
} );
