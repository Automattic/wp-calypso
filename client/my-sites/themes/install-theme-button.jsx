import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSiteMultiSite, isJetpackSite } from 'calypso/state/sites/selectors';
import siteCanUploadThemesOrPlugins from 'calypso/state/sites/selectors/can-upload-themes-or-plugins';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { trackClick } from './helpers';

import './install-theme-button.scss';

function getInstallThemeSlug( siteSlug, canUploadThemesOrPlugins ) {
	if ( ! siteSlug ) {
		return '/themes/upload';
	}

	if ( canUploadThemesOrPlugins ) {
		return `https://${ siteSlug }/wp-admin/theme-install.php`;
	}

	return `/themes/upload/${ siteSlug }`;
}

const InstallThemeButton = ( {
	isMultisite,
	jetpackSite,
	isLoggedIn,
	siteSlug,
	dispatchTracksEvent,
	canUploadThemesOrPlugins,
	atomicSite,
} ) => {
	if ( ! isLoggedIn || isMultisite ) {
		return null;
	}

	let siteType = null;
	if ( ! isLoggedIn ) {
		siteType = 'logged_out';
	} else if ( atomicSite ) {
		siteType = 'atomic';
	} else if ( jetpackSite ) {
		siteType = 'jetpack';
	} else if ( siteSlug ) {
		siteType = 'simple';
	}

	const clickHandler = () => {
		trackClick( 'upload theme' );
		dispatchTracksEvent( {
			tracksEventProps: {
				site_type: siteType,
			},
		} );
	};

	return (
		<Button
			className="themes__upload-button"
			onClick={ clickHandler }
			href={ getInstallThemeSlug( siteSlug, canUploadThemesOrPlugins ) }
		>
			{ translate( 'Install theme' ) }
		</Button>
	);
};

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		siteSlug: getSelectedSiteSlug( state ),
		isLoggedIn: isUserLoggedIn( state ),
		isMultisite: isJetpackSiteMultiSite( state, selectedSiteId ),
		jetpackSite: isJetpackSite( state, selectedSiteId ),
		canUploadThemesOrPlugins: siteCanUploadThemesOrPlugins( state, selectedSiteId ),
		atomicSite: isAtomicSite( state, selectedSiteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	dispatchTracksEvent: ( { tracksEventProps } ) =>
		dispatch( recordTracksEvent( 'calypso_click_theme_upload', tracksEventProps ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( InstallThemeButton );
