/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import { connectOptions } from './theme-options';
import { translate } from 'i18n-calypso';
import { trackClick } from './helpers';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { Button } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './install-theme-button.scss';

const InstallThemeButton = connectOptions( ( { isMultisite, isLoggedIn, siteSlug } ) => {
	// I'm not sure if this below code is needed, or if we can enforce these conditions by only including this component in the appropriate pages.
	if ( ! isLoggedIn || isMultisite ) {
		return null;
	}

	const clickHandler = () => {
		trackClick( 'upload theme' );
		recordTracksEvent( 'calypso_click_theme_upload' );
	};

	return (
		<Button
			className="themes__upload-button"
			onClick={ clickHandler }
			href={ siteSlug ? `/themes/upload/${ siteSlug }` : '/themes/upload' }
		>
			<Gridicon icon="cloud-upload" className="themes__upload-button-gridicon" />
			{ translate( 'Install theme' ) }
		</Button>
	);
} );

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		siteSlug: getSelectedSiteSlug( state ),
		isLoggedIn: isUserLoggedIn( state ),
		isMultisite: isJetpackSiteMultiSite( state, selectedSiteId ),
	};
};

export default connect( mapStateToProps )( InstallThemeButton );
