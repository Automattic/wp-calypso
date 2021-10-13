import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import ExporterContainer from 'calypso/my-sites/exporter/container';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

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
					brandFont
					className="exporter__section-header"
					headerText={ translate( 'Export Content' ) }
					subHeaderText={ translate(
						'Back up or move your content to another site or platform. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="export" showIcon={ false } />,
							},
						}
					) }
					align="left"
					hasScreenOptions
				/>
				<ExporterContainer />
			</Fragment>
		);
	}

	return (
		<Main>
			<ScreenOptionsTab wpAdminPath="export.php" />
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
