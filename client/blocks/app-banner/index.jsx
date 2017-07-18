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
import { getPreference } from 'state/preferences/selectors';
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
		dismissedUntil: React.PropTypes.array,
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
		return this.props.userAgent.match( /iPhone/i ) ? true : false;
	}

	isAndroid() {
		return this.props.userAgent.match( /Android/i ) ? true : false;
	}

	isMobile() {
		return this.isiOS() || this.isAndroid();
	}

	dismiss = ( event ) => {
		event.preventDefault();
		const { currentSection } = this.props;

		this.props.saveDismissTime( currentSection );
	};

	openApp = () => {
		this.props.recordAppBannerOpen( this.props.currentSection );
	};

	getDeepLink() {
		// TODO: update with real deep links when we get them
		// just linking to respective app stores for now
		if ( this.isAndroid() ) {
			return 'https://play.google.com/store/apps/details?id=org.wordpress.android';
		}

		if ( this.isiOS() ) {
			return 'https://itunes.apple.com/us/app/wordpress/id335703880';
		}

		return null;
	}

	render() {
		const { translate, currentSection } = this.props;

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
						target="_blank"
						rel="noopener noreferrer"
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
	};
};

const mapDispatchToProps = {
	recordAppBannerOpen: ( sectionName ) => recordTracksEvent( 'calypso_mobile_app_banner_open', { page: sectionName } ),
	saveDismissTime: ( sectionName ) => withAnalytics(
		recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { page: sectionName } ),
		savePreference( APP_BANNER_DISMISS_TIMES_PREFERENCE, getNewDismissTimes( sectionName ) )
	),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
