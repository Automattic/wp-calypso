/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, identity, includes, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { getSectionName, getSelectedSiteId } from 'state/ui/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import isNotificationsOpen from 'state/selectors/is-notifications-open';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import TrackComponentView from 'lib/analytics/track-component-view';
import {
	ALLOWED_SECTIONS,
	EDITOR,
	GUTENBERG,
	NOTES,
	READER,
	STATS,
	getAppBannerData,
	getNewDismissTimes,
	getCurrentSection,
	isDismissed,
	APP_BANNER_DISMISS_TIMES_PREFERENCE,
} from './utils';
import versionCompare from 'lib/version-compare';
import { isWpMobileApp } from 'lib/mobile-app';
import { shouldDisplayTosUpdateBanner } from 'state/selectors/should-display-tos-update-banner';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import editorBannerImage from 'assets/images/illustrations/app-banner-editor.svg';
import notificationsBannerImage from 'assets/images/illustrations/app-banner-notifications.svg';
import readerBannerImage from 'assets/images/illustrations/app-banner-reader.svg';
import statsBannerImage from 'assets/images/illustrations/app-banner-stats.svg';

const IOS_REGEX = /iPad|iPod|iPhone/i;
const ANDROID_REGEX = /Android (\d+(\.\d+)?(\.\d+)?)/i;

export class AppBanner extends Component {
	static propTypes = {
		saveDismissTime: PropTypes.func,
		translate: PropTypes.func,
		recordAppBannerOpen: PropTypes.func,
		userAgent: PropTypes.string,
		// connected
		currentSection: PropTypes.string,
		dismissedUntil: PropTypes.object,
		fetchingPreferences: PropTypes.bool,
	};

	static defaultProps = {
		saveDismissTime: noop,
		translate: identity,
		recordAppBannerOpen: noop,
		userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
	};

	stopBubblingEvents = event => {
		event.stopPropagation();
	};

	preventNotificationsClose = appBanner => {
		if ( ! appBanner && this.appBannerNode ) {
			this.appBannerNode.removeEventListener( 'mousedown', this.stopBubblingEvents, false );
			this.appBannerNode.removeEventListener( 'touchstart', this.stopBubblingEvents, false );
			return;
		}
		if ( appBanner ) {
			this.appBannerNode = ReactDom.findDOMNode( appBanner );
			this.appBannerNode.addEventListener( 'mousedown', this.stopBubblingEvents, false );
			this.appBannerNode.addEventListener( 'touchstart', this.stopBubblingEvents, false );
		}
	};

	isVisible() {
		const { dismissedUntil, currentSection, isTosBannerVisible } = this.props;

		// The ToS update banner is displayed in the same position as the mobile app banner. Since the ToS update
		// has higher priority, we repress all other non-essential sticky banners if the ToS update banner needs to
		// be displayed.
		if ( isTosBannerVisible ) {
			return false;
		}

		return this.isMobile() && ! isWpMobileApp() && ! isDismissed( dismissedUntil, currentSection );
	}

	isiOS() {
		return IOS_REGEX.test( this.props.userAgent );
	}

	isAndroid() {
		const match = ANDROID_REGEX.exec( this.props.userAgent );
		const version = get( match, '1', '0' );
		//intents are only supported on Android 4.4+
		return versionCompare( version, '4.4', '>=' );
	}

	isMobile() {
		return this.isiOS() || this.isAndroid();
	}

	dismiss = event => {
		event.preventDefault();
		const { currentSection, dismissedUntil } = this.props;

		this.props.saveDismissTime( currentSection, dismissedUntil );
	};

	openApp = () => {
		this.props.recordAppBannerOpen( this.props.currentSection );
	};

	getBannerImage() {
		switch ( this.props.currentSection ) {
			case EDITOR:
			case GUTENBERG:
				return editorBannerImage;
			case NOTES:
				return notificationsBannerImage;
			case READER:
				return readerBannerImage;
			case STATS:
				return statsBannerImage;
		}
	}

	getDeepLink() {
		const { currentRoute, currentSection } = this.props;

		if ( this.isAndroid() ) {
			//TODO: update when section deep links are available.
			switch ( currentSection ) {
				case EDITOR:
				case GUTENBERG:
					return 'intent://post/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case NOTES:
					return 'intent://notifications/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case READER:
					return 'intent://read/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case STATS:
					return 'intent://stats/#Intent;scheme=wordpress;package=org.wordpress.android;end';
			}
		}

		if ( this.isiOS() ) {
			return getiOSDeepLink( currentRoute, currentSection );
		}

		return null;
	}

	render() {
		const { translate, currentSection, fetchingPreferences } = this.props;

		if ( fetchingPreferences ) {
			return null;
		}

		if ( ! includes( ALLOWED_SECTIONS, currentSection ) ) {
			return null;
		}

		if ( ! this.isVisible() ) {
			return null;
		}

		const { title, copy } = getAppBannerData( translate, currentSection );

		return (
			<Card
				className={ classNames( 'app-banner', 'is-compact', currentSection ) }
				ref={ this.preventNotificationsClose }
			>
				<TrackComponentView
					eventName="calypso_mobile_app_banner_impression"
					eventProperties={ {
						page: currentSection,
					} }
					statGroup="calypso_mobile_app_banner"
					statName="impression"
				/>
				<img className="app-banner__illustration" src={ this.getBannerImage() } alt="" />
				<div className="app-banner__text-content">
					<div className="app-banner__title">
						<span> { title } </span>
					</div>
					<div className="app-banner__copy">
						<span> { copy } </span>
					</div>
				</div>
				<div className="app-banner__buttons">
					<Button
						primary
						className="app-banner__open-button"
						onClick={ this.openApp }
						href={ this.getDeepLink() }
					>
						{ translate( 'Open in app' ) }
					</Button>
					<Button className="app-banner__no-thanks-button" onClick={ this.dismiss }>
						{ translate( 'No thanks' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

export function getiOSDeepLink( currentRoute, currentSection ) {
	const baseURI = 'https://apps.wordpress.com/get?campaign=calypso-open-in-app';
	const fragment = buildDeepLinkFragment( currentRoute, currentSection );

	return fragment.length > 0 ? `${ baseURI }#${ fragment }` : baseURI;
}

export function buildDeepLinkFragment( currentRoute, currentSection ) {
	const hasRoute = currentRoute !== null && currentRoute !== '/';

	const getFragment = () => {
		switch ( currentSection ) {
			case EDITOR:
				return '/post';
			case GUTENBERG:
				return '/block-editor/post';
			case NOTES:
				return '/notifications';
			case READER:
				// The Reader is generally accessed at the root of WordPress.com ('/').
				// In this case, we need to manually add the section name to the
				// URL so that the iOS app knows which section to open.
				return hasRoute ? currentRoute : '/read';
			case STATS:
				return hasRoute ? currentRoute : '/stats';
			default:
				return '';
		}
	};

	return encodeURIComponent( getFragment() );
}

const mapStateToProps = state => {
	const sectionName = getSectionName( state );
	const isNotesOpen = isNotificationsOpen( state );
	const currentRoute = getCurrentRoute( state );

	return {
		dismissedUntil: getPreference( state, APP_BANNER_DISMISS_TIMES_PREFERENCE ),
		currentSection: getCurrentSection( sectionName, isNotesOpen, currentRoute ),
		currentRoute,
		fetchingPreferences: isFetchingPreferences( state ),
		siteId: getSelectedSiteId( state ),
		isTosBannerVisible: shouldDisplayTosUpdateBanner( state ),
	};
};

const mapDispatchToProps = {
	recordAppBannerOpen: sectionName =>
		composeAnalytics(
			recordTracksEvent( 'calypso_mobile_app_banner_open', { page: sectionName } ),
			bumpStat( 'calypso_mobile_app_banner', 'banner_open' )
		),
	saveDismissTime: ( sectionName, currentDimissTimes ) =>
		withAnalytics(
			composeAnalytics(
				recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { page: sectionName } ),
				bumpStat( 'calypso_mobile_app_banner', 'banner_dismiss' )
			),
			savePreference(
				APP_BANNER_DISMISS_TIMES_PREFERENCE,
				getNewDismissTimes( sectionName, currentDimissTimes )
			)
		),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
