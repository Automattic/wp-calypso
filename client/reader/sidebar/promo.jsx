import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import AsyncLoad from 'calypso/components/async-load';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

export const ReaderSidebarPromo = ( { currentUserLocale, shouldRenderAppPromo } ) => {
	return (
		<Fragment>
			<QueryUserSettings />

			{ shouldRenderAppPromo && (
				<div className="sidebar__app-promo">
					<AsyncLoad
						require="calypso/blocks/app-promo"
						placeholder={ null }
						location="reader"
						locale={ currentUserLocale }
					/>
				</div>
			) }
		</Fragment>
	);
};

export const shouldRenderAppPromo = ( options = {} ) => {
	// Until the user settings have loaded we'll indicate the user is is a
	// desktop app user because until the user settings have loaded
	// userSettings.getSetting( 'is_desktop_app_user' ) will return false which
	// makes the app think the user isn't a desktop app user for a few seconds
	// resulting in the AppPromo potentially flashing in then out as soon as
	// the user settings does properly indicate that the user is one.
	const haveUserSettingsLoaded = options.isDesktopAppUser === null;
	const {
		isDesktopPromoDisabled = store.get( 'desktop_promo_disabled' ),
		isViewportMobile = isMobile(),
		isUserLocaleEnglish = 'en' === options.currentUserLocale,
		isDesktopPromoConfiguredToRun = config.isEnabled( 'desktop-promo' ),
		isUserDesktopAppUser = haveUserSettingsLoaded || options.isDesktopAppUser,
		isUserOnChromeOs = /\bCrOS\b/.test( window.navigator.userAgent ),
	} = options;

	return (
		! isDesktopPromoDisabled &&
		isUserLocaleEnglish &&
		! isViewportMobile &&
		! isUserOnChromeOs &&
		isDesktopPromoConfiguredToRun &&
		! isUserDesktopAppUser
	);
};

export default connect( ( state ) => {
	const newProps = {
		currentUserLocale: getCurrentUserLocale( state ),
		isDesktopAppUser: getUserSetting( state, 'is_desktop_app_user' ),
	};
	newProps.shouldRenderAppPromo = shouldRenderAppPromo( newProps );
	return newProps;
} )( localize( ReaderSidebarPromo ) );
