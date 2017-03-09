/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';

export default class DisconnectJetpack extends Component {
	render() {
		return (
			<Dialog isVisible={ this.props.isVisible } baseClassName="disconnect-jetpack__dialog" >
				<h1>Disconnect Jetpack</h1>
				<p className="disconnect-jetpack__highlight">You are about to disconnect Jetpack and WordPress.com from your website.</p>
				<p className="disconnect-jetpack__info">If you disconnect, you will experience the following changes:</p>

			<div className="disconnect-jetpack__feature">
				<Gridicon icon="globe" />Your custom domain will no longer work
			</div>
			<div className="disconnect-jetpack__feature">
				<Gridicon icon="notice" />Your <a href="#" >premium plan</a> benefits won't be available
			</div>
			<div className="disconnect-jetpack__feature">
				<Gridicon icon="user" />Your team won't be able to manage the site using WordPress.com
			</div>

			<div className="disconnect-jetpack__button-wrap">
				<Button onClick={ this.props.onStay }>Stay Connected</Button>
				<Button primary scary onClick={ this.props.onDisconnect }>Disconnect</Button>
			</div>
			<a className="disconnect-jetpack__more-info-link" href="#">Read More about Jetpack benefits</a>
			</Dialog>
		);
	}
}

DisconnectJetpack.displayName = 'DisconnectJetpack';

DisconnectJetpack.propTypes = {
	isVisible: PropTypes.bool,
	onDisconnect: PropTypes.func,
	onStay: PropTypes.func,
};
