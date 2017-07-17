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
import { getActionLog } from 'state/ui/action-log/selectors';
import { getUserSetting, isNotificationsOpen } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { ROUTE_SET } from 'state/action-types';
import { saveUserSettings } from 'state/user-settings/actions';
import {
	findLast,
	get,
	identity,
	includes,
	noop
} from 'lodash';
import {
	ALLOWED_PAGE_TYPES,
	getAppBannerData,
	getNewDismissTimes,
	getPageType,
	isDismissed,
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
		dismissedUntil: React.PropTypes.object,
		pageType: React.PropTypes.string,
	};

	static defaultProps = {
		saveDismissTime: noop,
		translate: identity,
		trackAppBannerImpression: noop,
		trackAppBannerDismiss: noop,
		trackAppBannerOpen: noop,
		userAgent: navigator.userAgent,
	};

	state = {
		isHidden: false,
	};

	isVisible() {
		const { dismissedUntil, pageType } = this.props;

		return this.isMobile() && ! isDismissed( dismissedUntil, pageType ) && ! this.state.isHidden;
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
		const { pageType } = this.props;

		this.setState( { isHidden: true } );
		this.props.saveDismissTime( pageType );
		this.props.trackAppBannerDismiss( pageType );
	};

	openApp = ( event ) => {
		event.preventDefault();
		const { pageType } = this.props;

		this.props.trackAppBannerOpen( pageType );
	};

	render() {
		const { translate, pageType } = this.props;

		if ( ! includes( ALLOWED_PAGE_TYPES, pageType ) ) {
			return null;
		}

		if ( ! this.isVisible() ) {
			return null;
		}

		const { title, copy } = getAppBannerData( translate, pageType );

		this.props.trackAppBannerImpression( pageType );

		// TODO: generate deep links
		const deepLink = '#';

		return (
			<Card className={ classNames( 'app-banner', 'is-compact', pageType ) }>
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
						href={ deepLink }
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
	const currentRoute = findLast( getActionLog( state ), { type: ROUTE_SET } );
	const currentPath = get( currentRoute, 'path', null );
	const isNotesOpen = isNotificationsOpen( state );

	return {
		pageType: getPageType( currentPath, isNotesOpen ),
		dismissedUntil: getUserSetting( state, 'appBannerDismissTimes' ),
	};
};

const mapDispatchToProps = {
	trackAppBannerImpression: ( pageType ) => recordTracksEvent( 'calypso_mobile_app_banner_impression', { on_page: pageType } ),
	trackAppBannerDismiss: ( pageType ) => recordTracksEvent( 'calypso_mobile_app_banner_dismiss', { on_page: pageType } ),
	trackAppBannerOpen: ( pageType ) => recordTracksEvent( 'calypso_mobile_app_banner_open', { on_page: pageType } ),
	saveDismissTime: ( pageType ) => saveUserSettings( { appBannerDismissTimes: getNewDismissTimes( pageType ) } ),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AppBanner ) );
