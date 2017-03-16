/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import Button from 'components/button';
import { recordGoogleEvent } from 'state/analytics/actions';

class DisconnectJetpackDialog extends PureComponent {
	trackReadMoreClick = () => {
		this.props.recordGoogleEvent( 'Disconnect Jetpack Dialog', 'Clicked Read More about Jetpack benefits' );
	};

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
			return (
				<div key={ 'disconnect-jetpack-dialog__feature-' + index } className="disconnect-jetpack-dialog__feature">
					{ freature }
				</div>
			);
		} );
	}

	render() {
		const { onStay, onDisconnect, isVisible, translate, isBroken, siteName } = this.props;
		if ( isBroken ) {
			return (
				<Dialog isVisible={ isVisible } additionalClassNames="disconnect-jetpack-dialog" onClose={ onStay } >
				<h1>{ translate( 'Disconnect Jetpack' ) }</h1>
				<p className="disconnect-jetpack-dialog__highlight">
					{
						translate(
							'WordPress.com has not been able to reach %(siteName)s for a while.',
							{ args: { siteName } }
						)
					}
				</p>
				<div className="disconnect-jetpack-dialog__button-wrap">
					<Button primary scary onClick={ onDisconnect }>{ translate( 'Remove Site' ) }</Button>
				</div>
			</Dialog>
			);
		}

		return (
			<Dialog isVisible={ isVisible } additionalClassNames="disconnect-jetpack-dialog" onClose={ onStay } >
				<h1>{ translate( 'Disconnect from WordPress.com?' ) }</h1>
				<p className="disconnect-jetpack-dialog__highlight">
					{
						translate(
							'By disconnecting %(siteName)s from WordPress.com you will no longer have access to the following:',
							{ args: { siteName } }
						)
					}
				</p>

				{ this.planFeatures() }

				<div className="disconnect-jetpack-dialog__button-wrap">
					<Button onClick={ onStay }>{ translate( 'Stay Connected' ) }</Button>
					<Button primary scary onClick={ onDisconnect }>{ translate( 'Disconnect', { context: 'Jetpack: Action user takes to disconnect Jetpack site from .com' } ) }</Button>
				</div>
				<a
					onClick={ this.trackReadMoreClick }
					className="disconnect-jetpack-dialog__more-info-link"
					href="https://jetpack.com/features/">
					{ translate( 'Read More about Jetpack benefits' ) }
				</a>
			</Dialog>
		);
	}
}

DisconnectJetpackDialog.displayName = 'DisconnectJetpackDialog';

DisconnectJetpackDialog.propTypes = {
	isVisible: PropTypes.bool,
	onDisconnect: PropTypes.func,
	onStay: PropTypes.func,
	plan: PropTypes.string,
	isBroken: PropTypes.bool,
	siteName: PropTypes.string,
};

export default connect(
	null,
	{
		recordGoogleEvent
	}
)( localize( DisconnectJetpackDialog ) );
