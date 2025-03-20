import { localize } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const SectionExport = ( { canUserExport, site, translate } ) => {
	useEffect( () => {
		// Auto-redirect to wp-admin if the user has permission and site data is loaded
		if ( canUserExport && site && site.options?.admin_url ) {
			window.location.href = `${ site.options.admin_url }export.php`;
		}
	}, [ canUserExport, site ] );

	if ( ! canUserExport ) {
		return (
			<Main>
				<ScreenOptionsTab wpAdminPath="export.php" />
				<DocumentHead title={ translate( 'Export' ) } />
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-404.svg"
					title={ translate( 'You are not authorized to view this page' ) }
				/>
			</Main>
		);
	}

	// This will briefly show while redirecting
	return (
		<Main>
			<ScreenOptionsTab wpAdminPath="export.php" />
			<DocumentHead title={ translate( 'Export' ) } />
			<div></div>
		</Main>
	);
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		site,
		canUserExport: canCurrentUser( state, siteId, 'manage_options' ),
	};
} )( localize( SectionExport ) );
