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
import { recordTracksEvent } from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
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
	PREFERENCE_NAME,
} from './utils';

class AppBanner extends Component {
	static propTypes = {
		saveDismissTime: PropTypes.func,
		translate: PropTypes.func,
		trackAppBannerImpression: PropTypes.func,
		trackAppBannerDismiss: PropTypes.func,
		trackAppBannerOpen: PropTypes.func,
		userAgent: PropTypes.string,
		// connected
		currentSection: React.PropTypes.string,
		dismissedUntil: React.PropTypes.object,
	};

	static defaultProps = {
		saveDismissTime: noop,
		translate: identity,
		trackAppBannerImpression: noop,
		trackAppBannerDismiss: noop,
		trackAppBannerOpen: noop,
		userAgent: navigator.userAgent,
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
		this.props.trackAppBannerDismiss( currentSection );
	};

	openApp = () => {
		this.props.trackAppBannerOpen( this.props.currentSection );
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

		this.props.trackAppBannerImpression( currentSection );

		return (
			<Card className={ classNames( 'app-banner', 'is-compact', currentSection ) }>
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
		dismissedUntil: getPreference( state, PREFERENCE_NAME ),
		currentSection: getCurrentSection( sectionName, isNotesOpen ),
	};
};

const mapDispatchToProps = {
	trackAppBannerImpression: ( sectionName ) => recordTracksEvent( 'calypso_mobile_app_banner_impression', { on_page: sectionName } ),
	trackAppBannerDismiss: ( sectionName ) => recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { on_page: sectionName } ),
	trackAppBannerOpen: ( sectionName ) => recordTracksEvent( 'calypso_mobile_app_banner_open', { on_page: sectionName } ),
	saveDismissTime: ( sectionName ) => savePreference( PREFERENCE_NAME, getNewDismissTimes( sectionName ) ),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
