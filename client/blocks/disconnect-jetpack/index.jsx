/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import Button from 'components/button';

class DisconnectJetpack extends Component {

	planFeatures() {
		const { plan, translate } = this.props;
		const features = [];

		switch ( plan ) {

			case 'free':
				features.push( translate( 'Site stats, related content, and sharing tools' ) );
				features.push( translate( 'Brute force attack protection and uptime monitoring' ) );
				features.push( translate( 'Unlimited, high-speed image hosting' ) );
				break;

			case 'personal':
				features.push( translate( 'Daily, automated backups (unlimited storage)' ) );
				features.push( translate( 'Priority WordPress and security support' ) );
				features.push( translate( 'Spam filtering' ) );
				break;

			case 'premium':
				features.push( translate( 'Daily, automated backups (unlimited storage)' ) );
				features.push( translate( 'Daily, automated malware scanning' ) );
				features.push( translate( 'Priority WordPress and security support' ) );
				features.push( translate( '13Gb of high-speed video hosting' ) );
				break;

			case 'professional':
				features.push( translate( 'Daily, automated backups (unlimited storage)' ) );
				features.push( translate( 'Daily, automated malware scanning with automated resolution' ) );
				features.push( translate( 'Priority WordPress and security support' ) );
				features.push( translate( 'Unlimited high-speed video hosting' ) );
				features.push( translate( 'SEO preview tools' ) );
				break;
		}

		return features.map( ( freature, index ) => {
			return <div key={ 'disconnect-jetpack__feature-' + index } className="disconnect-jetpack__feature">{ freature } </div>;
		} );
	}
	render() {
		const { onStay, onDisconnect, isVisible, translate } = this.props;
		return (
			<Dialog isVisible={ isVisible } baseClassName="disconnect-jetpack__dialog" >
				<h1>{ translate( 'Disconnect Jetpack?' ) }</h1>
				<p className="disconnect-jetpack__highlight">{ translate( 'By disconnecting Jetpack you will lose these services:' ) }</p>

				{ this.planFeatures() }

				<div className="disconnect-jetpack__button-wrap">
					<Button onClick={ onStay }>{ translate( 'Stay Connected' ) }</Button>
					<Button primary scary onClick={ onDisconnect }>{ translate( 'Disconnect' ) }</Button>
				</div>
				<a className="disconnect-jetpack__more-info-link" href="#">{ translate( 'Read More about Jetpack benefits' ) }</a>
			</Dialog>
		);
	}
}

DisconnectJetpack.displayName = 'DisconnectJetpack';

DisconnectJetpack.propTypes = {
	isVisible: PropTypes.bool,
	onDisconnect: PropTypes.func,
	onStay: PropTypes.func,
	plan: PropTypes.string,
	isBroken: PropTypes.bool,
};

export default localize( DisconnectJetpack );
