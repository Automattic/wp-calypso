import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSiteMultiSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { trackClick } from './helpers';
import './install-theme-button.scss';

interface TracksEventProps {
	tracksEventProps: { site_type: string | null };
}

interface InstallThemeButtonProps extends PropsFromRedux {
	canUploadThemesOrPlugins: boolean;
}

const InstallThemeButton: React.FC< InstallThemeButtonProps > = ( {
	isMultisite,
	jetpackSite,
	isLoggedIn,
	siteSlug,
	siteCanInstallThemes,
	dispatchTracksEvent,
	atomicSite,
} ) => {
	if ( ! isLoggedIn || isMultisite ) {
		return null;
	}

	let siteType: string | null = null;
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

	const getInstallThemeSlug = () => {
		if ( ! siteSlug ) {
			return '/themes/upload';
		}

		if ( siteCanInstallThemes ) {
			return `https://${ siteSlug }/wp-admin/theme-install.php`;
		}

		return `/themes/upload/${ siteSlug }`;
	};

	return (
		<Button
			className="themes__upload-button"
			onClick={ clickHandler }
			href={ getInstallThemeSlug() }
		>
			{ translate( 'Install theme' ) }
		</Button>
	);
};

const mapStateToProps = ( state: IAppState ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const atomicSite = isAtomicSite( state, selectedSiteId );
	return {
		siteSlug: getSelectedSiteSlug( state ),
		isLoggedIn: isUserLoggedIn( state ),
		isMultisite: isJetpackSiteMultiSite( state, selectedSiteId ),
		jetpackSite: isJetpackSite( state, selectedSiteId ),
		siteCanInstallThemes:
			siteHasFeature( state, selectedSiteId, FEATURE_INSTALL_THEMES ) && atomicSite,
		atomicSite,
	};
};

const mapDispatchToProps = ( dispatch: Dispatch ) => ( {
	dispatchTracksEvent: ( { tracksEventProps }: TracksEventProps ) =>
		dispatch( recordTracksEvent( 'calypso_click_theme_upload', tracksEventProps ) ),
} );

const connector = connect( mapStateToProps, mapDispatchToProps );
type PropsFromRedux = ConnectedProps< typeof connector >;

export default connector( InstallThemeButton );
