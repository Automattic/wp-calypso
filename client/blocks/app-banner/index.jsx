import { Button, Card } from '@automattic/components';
import { compose } from '@wordpress/compose';
import { getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { localize, withRtl } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import AnimatedIcon from 'calypso/components/animated-icon';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import versionCompare from 'calypso/lib/version-compare';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import shouldDisplayAppBanner from 'calypso/state/selectors/should-display-app-banner';
import { dismissAppBanner } from 'calypso/state/ui/actions';
import { getSectionName } from 'calypso/state/ui/selectors';
import {
	GUTENBERG,
	HOME,
	NOTES,
	READER,
	STATS,
	getAppBannerData,
	getNewDismissTimes,
	getCurrentSection,
	APP_BANNER_DISMISS_TIMES_PREFERENCE,
} from './utils';

import './style.scss';

const IOS_REGEX = /iPad|iPod|iPhone/i;
const ANDROID_REGEX = /Android (\d+(\.\d+)?(\.\d+)?)/i;
const noop = () => {};

export class AppBanner extends Component {
	static propTypes = {
		saveDismissTime: PropTypes.func,
		dismissAppBanner: PropTypes.func,
		translate: PropTypes.func,
		recordAppBannerOpen: PropTypes.func,
		userAgent: PropTypes.string,
		// connected
		currentSection: PropTypes.string,
		dismissedUntil: PropTypes.object,
		isVisible: PropTypes.bool,
	};

	static defaultProps = {
		saveDismissTime: noop,
		dismissAppBanner: noop,
		recordAppBannerOpen: noop,
		userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
	};

	constructor( props ) {
		super( props );

		let isDraftPostModalShown = false;
		try {
			if (
				typeof window !== 'undefined' &&
				window.sessionStorage?.getItem( 'wpcom_signup_complete_show_draft_post_modal' )
			) {
				isDraftPostModalShown = true;
			}
		} catch ( e ) {}

		let isLaunchpadEnabled = false;
		if (
			typeof window !== 'undefined' &&
			getQueryArg( window.location.href, 'showLaunchpad' ) === 'true'
		) {
			isLaunchpadEnabled = true;
		}

		this.state = { isDraftPostModalShown, isLaunchpadEnabled };
	}

	stopBubblingEvents = ( event ) => {
		event.stopPropagation();
	};

	preventNotificationsClose = ( appBanner ) => {
		if ( ! appBanner && this.appBannerNode ) {
			this.appBannerNode.removeEventListener( 'mousedown', this.stopBubblingEvents, false );
			this.appBannerNode.removeEventListener( 'touchstart', this.stopBubblingEvents, false );
			document.body.classList.remove( 'app-banner-is-visible' );
			return;
		}
		if ( appBanner ) {
			this.appBannerNode = ReactDom.findDOMNode( appBanner );
			this.appBannerNode.addEventListener( 'mousedown', this.stopBubblingEvents, false );
			this.appBannerNode.addEventListener( 'touchstart', this.stopBubblingEvents, false );
			document.body.classList.add( 'app-banner-is-visible' );
		}
	};

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

	dismiss = ( event ) => {
		event.preventDefault();

		const { currentSection, dismissedUntil } = this.props;
		this.props.saveDismissTime( currentSection, dismissedUntil );
		this.props.dismissAppBanner();
	};

	openApp = () => {
		this.props.recordAppBannerOpen( this.props.currentSection );
	};

	getDeepLink() {
		const { currentRoute, currentSection } = this.props;

		if ( this.isAndroid() ) {
			const scheme = 'jetpack';
			const packageName = 'com.jetpack.android';
			const utmDetails = `utm_source%3Dcalypso%26utm_campaign%3Dcalypso-mobile-banner`;

			switch ( currentSection ) {
				case GUTENBERG:
					return `intent://details?id=${ packageName }&url=${ scheme }://post&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case HOME:
					return `intent://details?id=${ packageName }&url=${ scheme }://home&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case NOTES:
					return `intent://details?id=${ packageName }&url=${ scheme }://notifications&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case READER:
					return `intent://details?id=${ packageName }&url=${ scheme }://read&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case STATS:
					return `intent://details?id=${ packageName }&url=${ scheme }://stats&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
			}
		}

		if ( this.isiOS() ) {
			return getiOSDeepLink( currentRoute, currentSection );
		}

		return null;
	}

	getJetpackAppBanner = ( { translate, currentSection, isRtl } ) => {
		const { title, copy, icon } = getAppBannerData( translate, currentSection, isRtl );

		return (
			<div className={ clsx( 'app-banner-overlay' ) } ref={ this.preventNotificationsClose }>
				<Card
					className={ clsx( 'app-banner', 'is-compact', currentSection ) }
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
					<AnimatedIcon className="app-banner__icon" icon={ icon } />
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
							{ translate( 'Open in the Jetpack app' ) }
						</Button>
						<Button className="app-banner__no-thanks-button" onClick={ this.dismiss }>
							{ translate( 'Continue in browser' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	};

	render() {
		if (
			! this.props.shouldDisplayAppBanner ||
			this.state.isDraftPostModalShown ||
			this.state.isLaunchpadEnabled
		) {
			return null;
		}

		return this.getJetpackAppBanner( this.props );
	}
}

export function getiOSDeepLink( currentRoute, currentSection ) {
	// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
	const baseURI = 'https://apps.wordpress.com/get?campaign=calypso-open-in-app';
	const fragment = buildDeepLinkFragment( currentRoute, currentSection );

	return fragment.length > 0 ? `${ baseURI }#${ fragment }` : baseURI;
}
/**
 * Returns the universal link that then gets used to send the user to the correct editor.
 * If the app is installed otherwise they will end up on the new site creaton flow after creating an account.
 * @param {string} currentRoute
 * @returns string
 */
function getEditorPath( currentRoute ) {
	const paths = currentRoute.split( '/' ).filter( ( path ) => path );

	if ( paths[ 0 ] && paths[ 1 ] ) {
		return '/' + paths[ 0 ] + '/' + paths[ 1 ];
	}
	if ( paths[ 0 ] ) {
		return '/' + paths[ 0 ];
	}
	return '/post';
}

/**
 * Builds the deep link fragment for the iOS app.
 * @param {string} currentRoute The current route.
 * @param {string} currentSection The current section.
 * @returns {string} The deep link fragment.
 */
export function buildDeepLinkFragment( currentRoute, currentSection ) {
	const hasRoute = currentRoute !== null && currentRoute !== '/';

	const getFragment = () => {
		switch ( currentSection ) {
			case GUTENBERG:
				return getEditorPath( currentRoute );
			case NOTES:
				return '/notifications';
			case READER:
				// The Reader is generally accessed at the root of WordPress.com ('/').
				// In this case, we need to manually add the section name to the
				// URL so that the iOS app knows which section to open.
				if ( ! hasRoute ) {
					return '/read';
				}

				// Replacing '/reader' with '/read' to ensure backwards compatibility i.e. updating the URL on web app should not break the deep link.
				return currentRoute.replace( /^\/reader/, '/read' );
			case STATS:
				return hasRoute ? currentRoute : '/stats';
			default:
				return '';
		}
	};

	return encodeURIComponent( getFragment() );
}

const mapStateToProps = ( state ) => {
	const sectionName = getSectionName( state );
	const isNotesOpen = isNotificationsOpen( state );

	return {
		dismissedUntil: getPreference( state, APP_BANNER_DISMISS_TIMES_PREFERENCE ),
		currentSection: getCurrentSection( sectionName, isNotesOpen ),
		currentRoute: getCurrentRoute( state ),
		shouldDisplayAppBanner: shouldDisplayAppBanner( state ),
	};
};

const mapDispatchToProps = {
	recordAppBannerOpen: ( sectionName ) =>
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
	dismissAppBanner,
};

export default compose(
	connect( mapStateToProps, mapDispatchToProps ),
	withRtl,
	localize
)( AppBanner );
