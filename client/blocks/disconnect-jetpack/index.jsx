/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Card from 'components/card';
import { recordGoogleEvent } from 'state/analytics/actions';
import { disconnect } from 'state/jetpack/connection/actions';
import { disconnectedSite as disconnectedSiteDeprecated } from 'lib/sites-list/actions';
import { setAllSitesSelected } from 'state/ui/actions';
import { successNotice, errorNotice, infoNotice, removeNotice } from 'state/notices/actions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanClass } from 'lib/plans/constants';
import { getSite, getSiteSlug, getSiteTitle } from 'state/sites/selectors';

class DisconnectJetpack extends PureComponent {
	static displayName = 'DisconnectJetpack';

	static propTypes = {
		isBroken: PropTypes.bool,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
		redirect: PropTypes.string,
		siteId: PropTypes.number,
		// Connected props
		plan: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	trackReadMoreClick = () => {
		this.props.recordGoogleEvent(
			'Disconnect Jetpack Dialog',
			'Clicked Read More about Jetpack benefits'
		);
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
				features.push(
					translate(
						'{{icon/}} Brute force attack protection and uptime monitoring',
						this.getIcon( 'lock' )
					)
				);
				features.push(
					translate( '{{icon/}} Unlimited, high-speed image hosting', this.getIcon( 'image' ) )
				);
				break;

			case 'is-personal-plan':
				features.push(
					translate(
						'{{icon/}} Daily, automated backups (unlimited storage)',
						this.getIcon( 'history' )
					)
				);
				features.push(
					translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) )
				);
				features.push( translate( '{{icon/}} Spam filtering', this.getIcon( 'spam' ) ) );
				break;

			case 'is-premium-plan':
				features.push(
					translate(
						'{{icon/}} Daily, automated backups (unlimited storage)',
						this.getIcon( 'history' )
					)
				);
				features.push(
					translate( '{{icon/}} Daily, automated malware scanning', this.getIcon( 'spam' ) )
				);
				features.push(
					translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) )
				);
				features.push(
					translate( '{{icon/}} 13Gb of high-speed video hosting', this.getIcon( 'video' ) )
				);
				break;

			case 'is-business-plan':
				features.push(
					translate(
						'{{icon/}} Daily, automated backups (unlimited storage)',
						this.getIcon( 'history' )
					)
				);
				features.push(
					translate(
						'{{icon/}} Daily, automated malware scanning with automated resolution',
						this.getIcon( 'spam' )
					)
				);
				features.push(
					translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) )
				);
				features.push(
					translate( '{{icon/}} Unlimited high-speed video hosting', this.getIcon( 'video' ) )
				);
				features.push( translate( '{{icon/}} SEO preview tools', this.getIcon( 'globe' ) ) );
				break;
		}

		return features.map( ( freature, index ) => {
			return (
				<div key={ 'disconnect-jetpack__feature-' + index } className="disconnect-jetpack__feature">
					{ freature }
				</div>
			);
		} );
	}

	disconnectJetpack = () => {
		const {
			onClose,
			redirect,
			site,
			siteId,
			siteTitle,
			translate,
			successNotice: showSuccessNotice,
			errorNotice: showErrorNotice,
			infoNotice: showInfoNotice,
			removeNotice: removeInfoNotice,
			disconnect: disconnectSite,
			recordGoogleEvent: recordGAEvent,
		} = this.props;

		onClose();

		recordGAEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );

		const { notice } = showInfoNotice(
			translate( 'Disconnecting %(siteName)s.', { args: { siteName: siteTitle } } ),
			{
				isPersistent: true,
				showDismiss: false,
			}
		);

		disconnectSite( siteId ).then(
			() => {
				// Removing the domain from a domain-only site results
				// in the site being deleted entirely. We need to call
				// `disconnectedSiteDeprecated` here because the site
				// exists in `sites-list` as well as the global store.
				disconnectedSiteDeprecated( site );
				this.props.setAllSitesSelected();
				removeInfoNotice( notice.noticeId );
				showSuccessNotice(
					translate( 'Successfully disconnected %(siteName)s.', { args: { siteName: siteTitle } } )
				);
				recordGAEvent( 'Jetpack', 'Successfully Disconnected' );
			},
			() => {
				removeInfoNotice( notice.noticeId );
				showErrorNotice(
					translate( '%(siteName)s failed to disconnect', { args: { siteName: siteTitle } } )
				);
				recordGAEvent( 'Jetpack', 'Failed Disconnected Site' );
			}
		);

		page.redirect( redirect );
	};

	render() {
		const { onClose, translate, isBroken, siteSlug } = this.props;
		if ( isBroken ) {
			return (
				<Card className="disconnect-jetpack">
					<h1>{ translate( 'Disconnect Jetpack' ) }</h1>
					<p className="disconnect-jetpack__highlight">
						{ translate( 'WordPress.com has not been able to reach %(siteSlug)s for a while.', {
							args: { siteSlug },
						} ) }
					</p>
					<div className="disconnect-jetpack__button-wrap">
						<Button primary scary onClick={ this.disconnectJetpack }>
							{ translate( 'Remove Site' ) }
						</Button>
					</div>
				</Card>
			);
		}

		return (
			<Card className="disconnect-jetpack">
				<h1 className="disconnect-jetpack__header">
					{ translate( 'Disconnect from WordPress.com?' ) }
				</h1>
				<p className="disconnect-jetpack__highlight">
					{ translate(
						'By disconnecting %(siteSlug)s from WordPress.com you will no longer have access to the following:',
						{ args: { siteSlug } }
					) }
				</p>

				{ this.planFeatures() }

				<div className="disconnect-jetpack__button-wrap">
					<Button onClick={ onClose }>{ translate( 'Stay Connected' ) }</Button>
					<Button primary scary onClick={ this.disconnectJetpack }>
						{ translate( 'Disconnect', {
							context: 'Jetpack: Action user takes to disconnect Jetpack site from .com',
						} ) }
					</Button>
				</div>
				<a
					onClick={ this.trackReadMoreClick }
					className="disconnect-jetpack__more-info-link"
					href="https://jetpack.com/features/"
				>
					{ translate( 'Read More about Jetpack benefits' ) }
				</a>
			</Card>
		);
	}
}

export default connect(
	( state, { siteId } ) => {
		const plan = getCurrentPlan( state, siteId );
		const planClass = plan && plan.productSlug ? getPlanClass( plan.productSlug ) : 'is-free-plan';

		return {
			plan: planClass,
			site: getSite( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
			siteTitle: getSiteTitle( state, siteId ),
		};
	},
	{
		setAllSitesSelected,
		recordGoogleEvent,
		disconnect,
		successNotice,
		errorNotice,
		infoNotice,
		removeNotice,
	}
)( localize( DisconnectJetpack ) );
