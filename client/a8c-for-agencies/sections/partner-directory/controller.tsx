import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PartnerDirectorySideBar from '../../components/sidebar-menu/partner-directory';
import {
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from './constants';
import PartnerDirectory from './partner-directory';

export const partnerDirectoryDashboardContext: Callback = ( context, next ) => {
	const validSections = [
		PARTNER_DIRECTORY_DASHBOARD_SLUG,
		PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
		PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	];

	const selectedSection = context.params.section ?? PARTNER_DIRECTORY_DASHBOARD_SLUG;

	if ( ! validSections.includes( selectedSection ) ) {
		page.redirect( A4A_PARTNER_DIRECTORY_LINK );
		return;
	}

	context.primary = (
		<>
			<PageViewTracker title="Partner Directory > Dashboard" path={ context.path } />
			<PartnerDirectory selectedSection={ selectedSection } />
		</>
	);
	context.secondary = <PartnerDirectorySideBar path={ context.path } />;
	next();
};
