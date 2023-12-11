import {
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_PRIORITY_SUPPORT,
	WPCOM_FEATURES_REAL_TIME_BACKUPS,
	WPCOM_FEATURES_SCAN,
	WPCOM_FEATURES_SEO_PREVIEW_TOOLS,
	WPCOM_FEATURES_VIDEO_HOSTING,
	WPCOM_FEATURES_VIDEOPRESS_UNLIMITED_STORAGE,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { disconnect } from 'calypso/state/jetpack/connection/actions';
import {
	successNotice,
	errorNotice,
	infoNotice,
	removeNotice,
} from 'calypso/state/notices/actions';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';

import './style.scss';

const noop = () => {};

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
		hasAntiSpam: PropTypes.bool,
		hasDailyBackups: PropTypes.bool,
		hasPrioritySupport: PropTypes.bool,
		hasRealTimeBackups: PropTypes.bool,
		hasScan: PropTypes.bool,
		hasSeoPreviewTools: PropTypes.bool,
		hasVideoHosting: PropTypes.bool,
		hasVideoPressUnlimitedStorage: PropTypes.bool,
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
		const { translate } = this.props;
		const features = [];

		if ( this.props.hasRealTimeBackups ) {
			features.push(
				translate(
					'{{icon/}} Real-time automated backups (unlimited storage)',
					this.getIcon( 'history' )
				)
			);
		} else if ( this.props.hasDailyBackups ) {
			features.push(
				translate(
					'{{icon/}} Daily automated backups (unlimited storage)',
					this.getIcon( 'history' )
				)
			);
		}

		if ( this.props.hasScan ) {
			features.push(
				translate( '{{icon/}} Real-time automated malware scanning', this.getIcon( 'spam' ) )
			);
		}

		if ( this.props.hasPrioritySupport ) {
			features.push(
				translate( '{{icon/}} Priority WordPress and security support', this.getIcon( 'chat' ) )
			);
		}

		if ( this.props.hasVideoPressUnlimitedStorage ) {
			features.push(
				translate( '{{icon/}} Unlimited high-speed video hosting', this.getIcon( 'video' ) )
			);
		} else if ( this.props.hasVideoHosting ) {
			features.push( translate( '{{icon/}} High-speed video hosting', this.getIcon( 'video' ) ) );
		}

		if ( this.props.hasSeoPreviewTools ) {
			features.push( translate( '{{icon/}} SEO preview tools', this.getIcon( 'globe' ) ) );
		}

		if ( this.props.hasAntiSpam ) {
			features.push( translate( '{{icon/}} Spam filtering', this.getIcon( 'spam' ) ) );
		}

		features.push(
			translate(
				'{{icon/}} Jetpack Stats, related content, and sharing tools',
				this.getIcon( 'stats-alt' )
			)
		);
		features.push(
			translate(
				'{{icon/}} Brute force attack protection and downtime monitoring',
				this.getIcon( 'lock' )
			)
		);
		features.push(
			translate( '{{icon/}} Unlimited, high-speed image hosting', this.getIcon( 'image' ) )
		);

		// Show the top 5 features they'll miss out on.
		return features.slice( 0, 5 ).map( ( feature, index ) => {
			return (
				<div key={ 'disconnect-jetpack__feature-' + index } className="disconnect-jetpack__feature">
					{ feature }
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
		} = this.props;

		onDisconnectClick();

		this.props.recordTracksEvent( 'calypso_jetpack_disconnect_confirm' );
		this.props.recordGoogleEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );

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
				this.props.recordGoogleEvent( 'Jetpack', 'Successfully Disconnected' );
			},
			( err ) => {
				removeInfoNotice( notice.noticeId );
				const errorMessage =
					( err && err.message ) ||
					translate( '%(siteName)s failed to disconnect', { args: { siteName: siteTitle } } );
				showErrorNotice( errorMessage );
				this.props.recordGoogleEvent( 'Jetpack', 'Failed Disconnected Site' );
			}
		);
	};

	handleTryRewind = () => {
		this.props.recordTracksEvent( 'calypso_disconnect_jetpack_try_rewind' );
		page( `/activity-log/${ this.props.siteSlug }` );
	};

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
						{ translate( 'Experiencing connection issues? Try to go back and restore your site.' ) }
					</p>
					<div className="disconnect-jetpack__try-rewind-button-wrap">
						<Button onClick={ this.handleTryRewind }>{ translate( 'Restore site' ) }</Button>
					</div>
				</Card>
			),
		];
	}
}

export default connect(
	( state, { siteId } ) => {
		const rewindState = getRewindState( state, siteId );
		return {
			hasAntiSpam: siteHasFeature( state, siteId, WPCOM_FEATURES_ANTISPAM ),
			hasDailyBackups: siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS ),
			hasPrioritySupport: siteHasFeature( state, siteId, WPCOM_FEATURES_PRIORITY_SUPPORT ),
			hasRealTimeBackups: siteHasFeature( state, siteId, WPCOM_FEATURES_REAL_TIME_BACKUPS ),
			hasScan: siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ),
			hasSeoPreviewTools: siteHasFeature( state, siteId, WPCOM_FEATURES_SEO_PREVIEW_TOOLS ),
			hasVideoHosting: siteHasFeature( state, siteId, WPCOM_FEATURES_VIDEO_HOSTING ),
			hasVideoPressUnlimitedStorage: siteHasFeature(
				state,
				siteId,
				WPCOM_FEATURES_VIDEOPRESS_UNLIMITED_STORAGE
			),
			siteSlug: getSiteSlug( state, siteId ),
			siteTitle: getSiteTitle( state, siteId ),
			rewindState: rewindState.state,
		};
	},
	{
		setAllSitesSelected,
		recordGoogleEvent,
		recordTracksEvent,
		disconnect,
		successNotice,
		errorNotice,
		infoNotice,
		removeNotice,
	}
)( localize( DisconnectJetpack ) );
