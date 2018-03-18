/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import HappychatButton from 'components/happychat/button';
import QueryRewindState from 'components/data/query-rewind-state';
import {
	recordGoogleEvent as recordGoogleEventAction,
	recordTracksEvent as recordTracksEventAction,
	withAnalytics,
} from 'state/analytics/actions';
import { disconnect } from 'state/jetpack/connection/actions';
import { setAllSitesSelected, navigate } from 'state/ui/actions';
import { successNotice, errorNotice, infoNotice, removeNotice } from 'state/notices/actions';
import { getPlanClass } from 'lib/plans/constants';
import { getSiteSlug, getSiteTitle, getSitePlanSlug } from 'state/sites/selectors';
import { getRewindState } from 'state/selectors';

class DisconnectJetpack extends PureComponent {
	static propTypes = {
		disconnectHref: PropTypes.string,
		isBroken: PropTypes.bool,
		onDisconnectClick: PropTypes.func,
		onStayConnectedClick: PropTypes.func,
		showTitle: PropTypes.bool,
		siteId: PropTypes.number,
		stayConnectedHref: PropTypes.string,
		// Connected props
		plan: PropTypes.string,
		siteSlug: PropTypes.string,
		siteTitle: PropTypes.string,
		setAllSitesSelected: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		recordTracksEvent: PropTypes.func,
		disconnect: PropTypes.func,
		successNotice: PropTypes.func,
		errorNotice: PropTypes.func,
		infoNotice: PropTypes.func,
		removeNotice: PropTypes.func,
		rewindState: PropTypes.string.isRequired,
	};

	static defaultProps = {
		showTitle: true,
		onDisconnectClick: noop,
		onStayConnectedClick: noop,
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
						'{{icon/}} Daily automated backups (unlimited storage)',
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
						'{{icon/}} Daily automated backups (unlimited storage)',
						this.getIcon( 'history' )
					)
				);
				features.push(
					translate( '{{icon/}} Daily automated malware scanning', this.getIcon( 'spam' ) )
				);
				features.push(
					translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) )
				);
				features.push(
					translate( '{{icon/}} 13GB of high-speed video hosting', this.getIcon( 'video' ) )
				);
				break;

			case 'is-business-plan':
				features.push(
					translate(
						'{{icon/}} Daily automated backups (unlimited storage)',
						this.getIcon( 'history' )
					)
				);
				features.push(
					translate(
						'{{icon/}} Daily automated malware scanning with automated resolution',
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
			onDisconnectClick,
			siteId,
			siteTitle,
			translate,
			successNotice: showSuccessNotice,
			errorNotice: showErrorNotice,
			infoNotice: showInfoNotice,
			removeNotice: removeInfoNotice,
			disconnect: disconnectSite,
			recordGoogleEvent,
			recordTracksEvent,
		} = this.props;

		onDisconnectClick();

		recordTracksEvent( 'calypso_jetpack_disconnect_confirm' );
		recordGoogleEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );

		const { notice } = showInfoNotice(
			translate( 'Disconnecting %(siteName)s.', { args: { siteName: siteTitle } } ),
			{
				isPersistent: true,
				showDismiss: false,
			}
		);

		disconnectSite( siteId ).then(
			() => {
				this.props.setAllSitesSelected();
				removeInfoNotice( notice.noticeId );
				showSuccessNotice(
					translate( 'Successfully disconnected %(siteName)s.', { args: { siteName: siteTitle } } )
				);
				recordGoogleEvent( 'Jetpack', 'Successfully Disconnected' );
			},
			() => {
				removeInfoNotice( notice.noticeId );
				showErrorNotice(
					translate( '%(siteName)s failed to disconnect', { args: { siteName: siteTitle } } )
				);
				recordGoogleEvent( 'Jetpack', 'Failed Disconnected Site' );
			}
		);
	};

	handleTryRewind = () => this.props.trackTryRewind( this.props.siteSlug );

	render() {
		const {
			disconnectHref,
			isBroken,
			onStayConnectedClick,
			showTitle,
			siteSlug,
			stayConnectedHref,
			translate,
			siteId,
			rewindState,
		} = this.props;
		if ( isBroken ) {
			return (
				<Card className="disconnect-jetpack">
					{ showTitle && <h1>{ translate( 'Disconnect Jetpack' ) }</h1> }
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

		return [
			<Card key="disconnect-jetpack" className="disconnect-jetpack__block">
				{ siteId && <QueryRewindState siteId={ siteId } /> }
				{ showTitle && (
					<h1 className="disconnect-jetpack__header">
						{ translate( 'Disconnect from WordPress.com?' ) }
					</h1>
				) }
				<p className="disconnect-jetpack__highlight">
					{ translate(
						'By disconnecting %(siteSlug)s from WordPress.com you will no longer have access to the following:',
						{ args: { siteSlug } }
					) }
				</p>

				{ this.planFeatures() }

				<div className="disconnect-jetpack__button-wrap">
					<Button href={ stayConnectedHref } onClick={ onStayConnectedClick }>
						{ translate( 'Stay connected' ) }
					</Button>
					<Button primary scary href={ disconnectHref } onClick={ this.disconnectJetpack }>
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
					{ translate( 'Read more about Jetpack benefits' ) }
				</a>
			</Card>,
			'active' === rewindState && (
				<Card
					key="disconnect-jetpack__try-rewind"
					className="disconnect-jetpack__try-rewind disconnect-jetpack__block"
				>
					<p className="disconnect-jetpack__highlight">
						{ translate( 'Experiencing connection issues? Try to go back and rewind your site.' ) }
					</p>
					<div className="disconnect-jetpack__try-rewind-button-wrap">
						<Button onClick={ this.handleTryRewind }>{ translate( 'Rewind site' ) }</Button>
						<HappychatButton borderless={ false } onClick={ this.props.trackTryRewindHelp } primary>
							<Gridicon icon="chat" size={ 18 } />
							{ translate( 'Get help' ) }
						</HappychatButton>
					</div>
				</Card>
			),
		];
	}
}

export default connect(
	( state, { siteId } ) => {
		const planSlug = getSitePlanSlug( state, siteId );
		const planClass = planSlug ? getPlanClass( planSlug ) : 'is-free-plan';
		const rewindState = getRewindState( state, siteId );
		return {
			plan: planClass,
			siteSlug: getSiteSlug( state, siteId ),
			siteTitle: getSiteTitle( state, siteId ),
			rewindState: rewindState.state,
		};
	},
	{
		setAllSitesSelected,
		recordGoogleEvent: recordGoogleEventAction,
		recordTracksEvent: recordTracksEventAction,
		disconnect,
		successNotice,
		errorNotice,
		infoNotice,
		removeNotice,
		trackTryRewind: siteSlug =>
			withAnalytics(
				recordTracksEventAction( 'calypso_disconnect_jetpack_try_rewind' ),
				navigate( `/stats/activity/${ siteSlug }` )
			),
		trackTryRewindHelp: () =>
			recordTracksEventAction( 'calypso_disconnect_jetpack_try_rewind_help' ),
	}
)( localize( DisconnectJetpack ) );
