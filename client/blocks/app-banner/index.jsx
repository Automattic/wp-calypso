import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { compose } from '@wordpress/compose';
import classNames from 'classnames';
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

		if (
			typeof window !== 'undefined' &&
			window.sessionStorage.getItem( 'wpcom_signup_complete_show_draft_post_modal' )
		) {
			this.state = { isDraftPostModalShown: true };
		} else {
			this.state = { isDraftPostModalShown: false };
		}
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
			const displayJetpackAppBranding = config.isEnabled( 'jetpack/app-branding' );
			const packageName = displayJetpackAppBranding
				? 'com.jetpack.android'
				: 'org.wordpress.android';
			const utmDetails = `utm_source%3Dcalypso%26utm_campaign%3Dcalypso-mobile-banner`;

			//TODO: update when section deep links are available.
			switch ( currentSection ) {
				case GUTENBERG:
					return `intent://details?id=${ packageName }&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case HOME:
					return `intent://details?id=${ packageName }&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case NOTES:
					return `intent://details?id=${ packageName }&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case READER:
					return `intent://details?id=${ packageName }&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
				case STATS:
					return `intent://details?id=${ packageName }&referrer=${ utmDetails }#Intent;scheme=market;action=android.intent.action.VIEW;package=com.android.vending;end`;
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
			<div className={ classNames( 'app-banner-overlay' ) } ref={ this.preventNotificationsClose }>
				<Card
					className={ classNames( 'app-banner', 'is-compact', currentSection, 'jetpack' ) }
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
					<div className="app-banner__text-content jetpack">
						<div className="app-banner__title jetpack">
							<span> { title } </span>
						</div>
						<div className="app-banner__copy jetpack">
							<span> { copy } </span>
						</div>
					</div>
					<div className="app-banner__buttons jetpack">
						<Button
							primary
							className="app-banner__open-button jetpack"
							onClick={ this.openApp }
							href={ this.getDeepLink() }
						>
							{ translate( 'Open in the Jetpack app' ) }
						</Button>
						<Button className="app-banner__no-thanks-button jetpack" onClick={ this.dismiss }>
							{ translate( 'Continue in browser' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	};

	getWordpressAppBanner = ( { translate, currentSection } ) => {
		const { title, copy } = getAppBannerData( translate, currentSection );

		// This conditional will be unnecessary once the 'jetpack/app-branding'
		// feature flag is removed and its features are made the default
		// experience, as getAppBannerData will then not include conditionals.
		if ( ! title || ! copy ) {
			return null;
		}

		return (
			<div className={ classNames( 'app-banner-overlay' ) } ref={ this.preventNotificationsClose }>
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
					<div className="app-banner__circle is-top-left is-yellow" />
					<div className="app-banner__circle is-top-right is-blue" />
					<div className="app-banner__circle is-bottom-right is-red" />
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
			</div>
		);
	};

	render() {
		if ( ! this.props.shouldDisplayAppBanner || this.state.isDraftPostModalShown ) {
			return null;
		}

		const displayJetpackAppBranding = config.isEnabled( 'jetpack/app-branding' );

		return displayJetpackAppBranding
			? this.getJetpackAppBanner( this.props )
			: this.getWordpressAppBanner( this.props );
	}
}

export function getiOSDeepLink( currentRoute, currentSection ) {
	const baseURI = 'https://apps.wordpress.com/get?campaign=calypso-open-in-app';
	const fragment = buildDeepLinkFragment( currentRoute, currentSection );

	return fragment.length > 0 ? `${ baseURI }#${ fragment }` : baseURI;
}
/**
 * Returns the universal link that then gets used to send the user to the correct editor.
 * If the app is installed otherwise they will end up on the new site creaton flow after creating an account.
 *
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
				return hasRoute ? currentRoute : '/read';
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
