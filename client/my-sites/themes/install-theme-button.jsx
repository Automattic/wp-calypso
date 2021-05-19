/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import siteCanUploadThemesOrPlugins from 'calypso/state/sites/selectors/can-upload-themes-or-plugins';
import { connectOptions } from './theme-options';
import { translate } from 'i18n-calypso';
import { trackClick } from './helpers';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getSelectedSiteId,
	getSelectedSiteSlug,
	getSelectedSite,
} from 'calypso/state/ui/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { Button } from '@automattic/components';
import { isATEnabled } from 'calypso/lib/automated-transfer';

/**
 * Style dependencies
 */
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

const InstallThemeButton = connectOptions(
	( {
		isMultisite,
		isLoggedIn,
		siteSlug,
		dispatchTracksEvent,
		canUploadThemesOrPlugins,
		ATEnabled,
	} ) => {
		if ( ! isLoggedIn || isMultisite ) {
			return null;
		}

		const clickHandler = () => {
			trackClick( 'upload theme' );
			dispatchTracksEvent( {
				tracksEventProps: {
					is_atomic: ATEnabled,
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
	}
);

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );
	return {
		siteSlug: getSelectedSiteSlug( state ),
		isLoggedIn: isUserLoggedIn( state ),
		isMultisite: isJetpackSiteMultiSite( state, selectedSiteId ),
		canUploadThemesOrPlugins: siteCanUploadThemesOrPlugins( state, selectedSiteId ),
		ATEnabled: isATEnabled( selectedSite ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	dispatchTracksEvent: ( { tracksEventProps } ) =>
		dispatch( recordTracksEvent( 'calypso_click_theme_upload', tracksEventProps ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( InstallThemeButton );
