/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import Button from 'components/button';

class DisconnectJetpack extends Component {

	translateArgs( icon ) {
		return { components: { icon: <Gridicon icon={ icon } /> } };
	}

	planFeatures() {
		const { plan, translate } = this.props;
		const features = [];
		switch ( plan ) {
			case 'free':
				features.push(
					translate( '{{icon/}} Site stats, related content, and sharing tools',
					this.translateArgs( 'stats-alt' )
				) );
				features.push(
					translate( '{{icon/}} Brute force attack protection and uptime monitoring',
					this.translateArgs( 'lock' )
				) );
				features.push( translate( '{{icon/}} Unlimited, high-speed image hosting', this.translateArgs( 'image' ) ) );
				break;

			case 'personal':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.translateArgs( 'history' ) ) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.translateArgs( 'chat' ) ) );
				features.push( translate( '{{icon/}} Spam filtering', this.translateArgs( 'spam' ) ) );
				break;

			case 'premium':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.translateArgs( 'history' ) ) );
				features.push( translate( '{{icon/}} Daily, automated malware scanning', this.translateArgs( 'spam' ) ) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.translateArgs( 'chat' ) ) );
				features.push( translate( '{{icon/}} 13Gb of high-speed video hosting', this.translateArgs( 'video' ) ) );
				break;

			case 'professional':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.translateArgs( 'history' ) ) );
				features.push(
					translate( '{{icon/}} Daily, automated malware scanning with automated resolution',
					this.translateArgs( 'spam' )
				) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.translateArgs( 'chat' ) ) );
				features.push( translate( '{{icon/}} Unlimited high-speed video hosting', this.translateArgs( 'video' ) ) );
				features.push( translate( '{{icon/}} SEO preview tools', this.translateArgs( 'globe' ) ) );
				break;
		}

		return features.map( ( freature, index ) => {
			return <div key={ 'disconnect-jetpack__feature-' + index } className="disconnect-jetpack__feature">{ freature } </div>;
		} );
	}
	render() {
		const { onStay, onDisconnect, isVisible, translate, isBroken } = this.props;
		if ( isBroken ) {
			return (
				<Dialog isVisible={ isVisible } baseClassName="disconnect-jetpack__dialog" >
				<h1>{ translate( 'Disconnect Jetpack' ) }</h1>
				<p className="disconnect-jetpack__highlight">{ translate( 'WordPress.com has not been able to react example.com for a while.' ) }</p>
				<div className="disconnect-jetpack__button-wrap">
					<Button primary scary onClick={ onDisconnect }>{ translate( 'Remove Site' ) }</Button>
				</div>
			</Dialog>
			);
		}

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
