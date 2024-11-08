import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	isJetpackSiteMultiSite,
	isJetpackSite,
	getSiteThemeInstallUrl,
	getSiteSlug,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { trackClick } from './helpers';

import './install-theme-button.scss';

function getInstallThemeUrl( state, siteId ) {
	if ( ! siteId ) {
		return '/themes/upload';
	}

	const atomicSite = isAtomicSite( state, siteId );
	const siteCanInstallThemes = siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES );
	const siteHasFeaturesLoaded = !! getSiteFeatures( state, siteId );

	if ( atomicSite && ( siteCanInstallThemes || ! siteHasFeaturesLoaded ) ) {
		const themeInstallUrlObj = new URL( getSiteThemeInstallUrl( state, siteId ) );
		themeInstallUrlObj.searchParams.append( 'browse', 'popular' );
		themeInstallUrlObj.searchParams.append( 'wpcom-upload', '1' );
		return themeInstallUrlObj.toString();
	}

	const siteSlug = getSiteSlug( state, siteId );
	return `/themes/upload/${ siteSlug }`;
}

function getSiteType( state, siteId ) {
	if ( isAtomicSite( state, siteId ) ) {
		return 'atomic';
	} else if ( isJetpackSite( state, siteId ) ) {
		return 'jetpack';
	} else if ( siteId ) {
		return 'simple';
	}

	return null;
}

export default function InstallThemeButton() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isMultisite = useSelector( ( state ) => isJetpackSiteMultiSite( state, selectedSiteId ) );
	const siteType = useSelector( ( state ) => getSiteType( state, selectedSiteId ) );
	const installThemeUrl = useSelector( ( state ) => getInstallThemeUrl( state, selectedSiteId ) );

	if ( ! isLoggedIn || isMultisite ) {
		return null;
	}

	const clickHandler = () => {
		trackClick( 'upload theme' );
		const tracksEventProps = { site_type: siteType };
		dispatch( recordTracksEvent( 'calypso_click_theme_upload', tracksEventProps ) );
		dispatch( recordTracksEvent( 'calypso_themeshowcase_install_button_click', tracksEventProps ) );
	};

	return (
		<Button className="themes__upload-button" onClick={ clickHandler } href={ installThemeUrl }>
			{ translate( 'Install new theme' ) }
		</Button>
	);
}
