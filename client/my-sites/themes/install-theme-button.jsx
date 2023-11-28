import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	isJetpackSiteMultiSite,
	isJetpackSite,
	getSiteAdminUrl,
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
	if ( atomicSite && siteCanInstallThemes ) {
		return getSiteAdminUrl( state, siteId, 'theme-install.php' );
	}

	const siteSlug = getSiteSlug( state, siteId );
	return `/themes/upload/${ siteSlug }`;
}

function getSiteType( atomicSite, jetpackSite, selectedSiteId ) {
	if ( atomicSite ) {
		return 'atomic';
	} else if ( jetpackSite ) {
		return 'jetpack';
	} else if ( selectedSiteId ) {
		return 'simple';
	}

	return null;
}

const InstallThemeButton = ( {
	isLoggedIn,
	selectedSiteId,
	isMultisite,
	atomicSite,
	jetpackSite,
	installThemeUrl,
	dispatchTracksEvent,
} ) => {
	if ( ! isLoggedIn || isMultisite ) {
		return null;
	}

	const clickHandler = () => {
		trackClick( 'upload theme' );
		dispatchTracksEvent( {
			tracksEventProps: {
				site_type: getSiteType( atomicSite, jetpackSite, selectedSiteId ),
			},
		} );
	};

	return (
		<Button className="themes__upload-button" onClick={ clickHandler } href={ installThemeUrl }>
			{ translate( 'Install new theme' ) }
		</Button>
	);
};

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isLoggedIn: isUserLoggedIn( state ),
		selectedSiteId,
		isMultisite: isJetpackSiteMultiSite( state, selectedSiteId ),
		atomicSite: isAtomicSite( state, selectedSiteId ),
		jetpackSite: isJetpackSite( state, selectedSiteId ),
		installThemeUrl: getInstallThemeUrl( state, selectedSiteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	dispatchTracksEvent: ( { tracksEventProps } ) => {
		dispatch( recordTracksEvent( 'calypso_click_theme_upload', tracksEventProps ) );
		dispatch( recordTracksEvent( 'calypso_themeshowcase_install_button_click', tracksEventProps ) );
	},
} );

export default connect( mapStateToProps, mapDispatchToProps )( InstallThemeButton );
