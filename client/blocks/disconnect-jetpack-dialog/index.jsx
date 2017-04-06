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

	getIcon( icon ) {
		return { components: { icon: <Gridicon icon={ icon } /> } };
	}

	planFeatures() {
		const { plan, translate } = this.props;
		const features = [];
		switch ( plan ) {
			case 'is-free-plan':
				features.push(
					translate(
						'{{icon/}} Site stats, related content, and sharing tools',
						this.getIcon( 'stats-alt' )
					)
				);
				features.push( translate(
					'{{icon/}} Brute force attack protection and uptime monitoring',
					this.getIcon( 'lock' )
				) );
				features.push( translate( '{{icon/}} Unlimited, high-speed image hosting', this.getIcon( 'image' ) ) );
				break;

			case 'is-personal-plan':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.getIcon( 'history' ) ) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) ) );
				features.push( translate( '{{icon/}} Spam filtering', this.getIcon( 'spam' ) ) );
				break;

			case 'is-premium-plan':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.getIcon( 'history' ) ) );
				features.push( translate( '{{icon/}} Daily, automated malware scanning', this.getIcon( 'spam' ) ) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) ) );
				features.push( translate( '{{icon/}} 13Gb of high-speed video hosting', this.getIcon( 'video' ) ) );
				break;

			case 'is-business-plan':
				features.push( translate( '{{icon/}} Daily, automated backups (unlimited storage)', this.getIcon( 'history' ) ) );
				features.push(
					translate( '{{icon/}} Daily, automated malware scanning with automated resolution',
					this.getIcon( 'spam' )
				) );
				features.push( translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) ) );
				features.push( translate( '{{icon/}} Unlimited high-speed video hosting', this.getIcon( 'video' ) ) );
				features.push( translate( '{{icon/}} SEO preview tools', this.getIcon( 'globe' ) ) );
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
		const { onClose, onDisconnect, isVisible, translate, isBroken, siteName } = this.props;
		if ( isBroken ) {
			return (
				<Dialog isVisible={ isVisible } additionalClassNames="disconnect-jetpack-dialog" onClose={ onClose } >
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
			<Dialog isVisible={ isVisible } additionalClassNames="disconnect-jetpack-dialog" onClose={ onClose } >
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
					<Button onClick={ onClose }>{ translate( 'Stay Connected' ) }</Button>
					<Button primary scary onClick={ onDisconnect }>
						{ translate( 'Disconnect', { context: 'Jetpack: Action user takes to disconnect Jetpack site from .com' } ) }
					</Button>
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
	onClose: PropTypes.func,
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
