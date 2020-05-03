/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import ExporterContainer from 'my-sites/exporter/container';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { isJetpackSite } from 'state/sites/selectors';
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const SectionExport = ( { isJetpack, canUserExport, site, translate } ) => {
	let sectionContent;

	if ( ! canUserExport ) {
		sectionContent = (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'You are not authorized to view this page' ) }
			/>
		);
	} else if ( isJetpack ) {
		sectionContent = (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
				title={ translate( 'Want to export your site?' ) }
				line={ translate( "Visit your site's wp-admin for all your import and export needs." ) }
				action={ translate( 'Export %(siteTitle)s', { args: { siteTitle: site.title } } ) }
				actionURL={ site.options.admin_url + 'export.php' }
				actionTarget="_blank"
			/>
		);
	} else {
		sectionContent = (
			<Fragment>
				<FormattedHeader
					className="exporter__section-header"
					headerText={ translate( 'Export Your Content' ) }
					subHeaderText={ translate( 'Your content on WordPress.com is always yours.' ) }
					align="left"
				/>
				<ExporterContainer />
			</Fragment>
		);
	}

	return (
		<Main>
			<DocumentHead title={ translate( 'Export' ) } />
			<SidebarNavigation />
			{ sectionContent }
		</Main>
	);
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		isJetpack: isJetpackSite( state, siteId ),
		site,
		siteSlug: getSelectedSiteSlug( state ),
		canUserExport: canCurrentUser( state, siteId, 'manage_options' ),
	};
} )( localize( SectionExport ) );
