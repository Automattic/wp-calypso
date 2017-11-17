/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import ExporterContainer from 'my-sites/exporter';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Placeholder from 'my-sites/site-settings/placeholder';

const SiteSettingsExport = ( { isJetpack, site, siteSlug, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main>
			<HeaderCake backHref={ '/settings/general/' + siteSlug }>
				<h1>{ translate( 'Export' ) }</h1>
			</HeaderCake>
			{ isJetpack && (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-jetpack.svg"
					title={ translate( 'Want to export your site?' ) }
					line={ translate( "Visit your site's wp-admin for all your import and export needs." ) }
					action={ translate( 'Export %(siteTitle)s', { args: { siteTitle: site.title } } ) }
					actionURL={ site.options.admin_url + 'export.php' }
					actionTarget="_blank"
				/>
			) }
			{ isJetpack === false && <ExporterContainer /> }
		</Main>
	);
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );

	return {
		isJetpack: selectedSiteId && isJetpackSite( state, selectedSiteId ),
		site,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( SiteSettingsExport ) );
