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
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import TrackComponentView from 'lib/analytics/track-component-view';
import {
	identity,
	includes,
	noop
} from 'lodash';
import {
	ALLOWED_SECTIONS,
	getAppBannerData,
	getNewDismissTimes,
	getCurrentSection,
	isDismissed,
	APP_BANNER_DISMISS_TIMES_PREFERENCE,
} from './utils';

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
		return /iPad|iPod|iPhone/i.test( this.props.userAgent );
	}

	isAndroid() {
		return /Android/i.test( this.props.userAgent );
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
		// TODO: update with real deep links when we get them
		// just linking to respective app stores for now
		if ( this.isAndroid() ) {
			return 'intent://editor/#Intent;scheme=wordpress;package=org.wordpress.android;end';
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
	};
};

const mapDispatchToProps = {
	recordAppBannerOpen: ( sectionName ) => recordTracksEvent( 'calypso_mobile_app_banner_open', { page: sectionName } ),
	saveDismissTime: ( sectionName, currentDimissTimes ) => withAnalytics(
		recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { page: sectionName } ),
		savePreference( APP_BANNER_DISMISS_TIMES_PREFERENCE, getNewDismissTimes( sectionName, currentDimissTimes ) )
	),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
