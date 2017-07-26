/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { getSectionName } from 'state/ui/selectors';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import { isNotificationsOpen } from 'state/selectors';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	get,
	identity,
	includes,
	noop
} from 'lodash';
import {
	ALLOWED_SECTIONS,
	EDITOR,
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

const IOS_REGEX = /iPad|iPod|iPhone/i;
const ANDROID_REGEX = /Android (\d+(\.\d+)?(\.\d+)?)/i;

class AppBanner extends Component {
	static propTypes = {
		saveDismissTime: PropTypes.func,
		translate: PropTypes.func,
		recordAppBannerOpen: PropTypes.func,
		userAgent: PropTypes.string,
		// connected
		currentSection: React.PropTypes.string,
		dismissedUntil: React.PropTypes.object,
		fetchingPreferences: React.PropTypes.bool,
	};

	static defaultProps = {
		saveDismissTime: noop,
		translate: identity,
		recordAppBannerOpen: noop,
		userAgent: ( typeof window !== 'undefined' ) ? navigator.userAgent : '',
	};

	isVisible() {
		const { dismissedUntil, currentSection } = this.props;

		return this.isMobile() && ! isDismissed( dismissedUntil, currentSection );
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

	dismiss = ( event ) => {
		event.preventDefault();
		const { currentSection, dismissedUntil } = this.props;

		this.props.saveDismissTime( currentSection, dismissedUntil );
	};

	openApp = () => {
		this.props.recordAppBannerOpen( this.props.currentSection );
	};

	getDeepLink() {
		const { currentSection, siteId } = this.props;
		// TODO: update with real deep links when we get them
		// just linking to respective app stores for now
		if ( this.isAndroid() ) {
			switch ( currentSection ) {
				case EDITOR:
					'intent://editor/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case NOTES:
					return 'intent://viewnotifications/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case READER:
					return 'intent://viewpost/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				case STATS:
					if ( siteId ) {
						return `intent://viewstats/?siteId=${ siteId }#Intent;scheme=wordpress;package=org.wordpress.android;end'`;
					}
					return 'intent://viewstats/#Intent;scheme=wordpress;package=org.wordpress.android;end';
				default:
					return 'intent://editor/#Intent;scheme=wordpress;package=org.wordpress.android;end';
			}
		}

		if ( this.isiOS() ) {
			return 'itms://itunes.apple.com/us/app/wordpress/id335703880?mt=8';
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
			<Card className={ classNames( 'app-banner', 'is-compact', currentSection ) }>
				<TrackComponentView
					eventName="calypso_mobile_app_banner_impression"
					eventProperties={ {
						page: currentSection,
					} }
					statGroup="calypso_mobile_app_banner"
					statName="impression"
				/>
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
						className="app-banner__open-button"
						onClick={ this.openApp }
						href={ this.getDeepLink() }
					>
						{ translate( 'Open in app' ) }
					</Button>
					<a
						className="app-banner__no-thanks-button"
						onClick={ this.dismiss }
					>
						{ translate( 'No thanks' ) }
					</a>
				</div>
			</Card>
		);
	}
}

const mapStateToProps = ( state ) => {
	const sectionName = getSectionName( state );
	const isNotesOpen = isNotificationsOpen( state );

	return {
		dismissedUntil: getPreference( state, APP_BANNER_DISMISS_TIMES_PREFERENCE ),
		currentSection: getCurrentSection( sectionName, isNotesOpen ),
		fetchingPreferences: isFetchingPreferences( state ),
		siteId: getSelectedSiteId( state ),
	};
};

const mapDispatchToProps = {
	recordAppBannerOpen: ( sectionName ) => composeAnalytics(
		recordTracksEvent( 'calypso_mobile_app_banner_open', { page: sectionName } ),
		bumpStat( 'calypso_mobile_app_banner', 'banner_open' )
	),
	saveDismissTime: ( sectionName, currentDimissTimes ) => withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { page: sectionName } ),
			bumpStat( 'calypso_mobile_app_banner', 'banner_dismiss' )
		),
		savePreference( APP_BANNER_DISMISS_TIMES_PREFERENCE, getNewDismissTimes( sectionName, currentDimissTimes ) )
	),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
