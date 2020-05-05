/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SingleSiteThemeShowcaseWpcom from './single-site-wpcom';
import SingleSiteThemeShowcaseJetpack from './single-site-jetpack';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isThemeActive } from 'state/themes/selectors';

const SingleSiteThemeShowcaseWithOptions = ( props ) => {
	const { isJetpack, siteId, translate } = props;

	// If we've only just switched from single to multi-site, there's a chance
	// this component is still being rendered with site unset, so we need to guard
	// against that case.
	if ( ! siteId ) {
		return <Main className="themes" />;
	}

	if ( isJetpack ) {
		return (
			<SingleSiteThemeShowcaseJetpack
				{ ...props }
				siteId={ siteId }
				defaultOption="activate"
				secondaryOption="tryandcustomize"
				source="showcase"
				listLabel={ translate( 'Uploaded themes' ) }
				placeholderCount={ 5 }
			/>
		);
	}

	return (
		<SingleSiteThemeShowcaseWpcom
			{ ...props }
			origin="wpcom"
			siteId={ siteId }
			defaultOption="activate"
			secondaryOption="tryandcustomize"
			source="showcase"
		/>
	);
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		siteId: selectedSiteId,
		isJetpack: isJetpackSite( state, selectedSiteId ),
		getScreenshotOption: ( themeId ) =>
			isThemeActive( state, themeId, selectedSiteId ) ? 'customize' : 'info',
	};
} )( localize( SingleSiteThemeShowcaseWithOptions ) );
