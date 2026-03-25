import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import PartnerDirectorySideBar from '../../components/sidebar-menu/partner-directory';
import {
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_LEAD_MATCHING_SLUG,
} from './constants';
import { isLeadMatchingSectionVisible } from './lib/lead-matching-visibility';
import PartnerDirectory from './partner-directory';

export const partnerDirectoryDashboardContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const hasDirectoryApproval = agency?.profile?.partner_directory_application?.directories.some(
		( { status } ) => status === 'approved'
	);
	const canAccessLeadMatching = isLeadMatchingSectionVisible();

	const validSections = [
		PARTNER_DIRECTORY_DASHBOARD_SLUG,
		// Agency details is hidden if the agency has no directories approved
		...( hasDirectoryApproval ? [ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG ] : [] ),
		PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
		...( canAccessLeadMatching ? [ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG ] : [] ),
	];

	const selectedSection = context.params.section ?? PARTNER_DIRECTORY_DASHBOARD_SLUG;

	if ( ! validSections.includes( selectedSection ) ) {
		page.redirect( A4A_PARTNER_DIRECTORY_LINK );
		return;
	}

	context.primary = (
		<>
			<PageViewTracker
				title={
					selectedSection === PARTNER_DIRECTORY_LEAD_MATCHING_SLUG
						? 'Partner Directory > Lead Matching'
						: 'Partner Directory > Dashboard'
				}
				path={ context.path }
			/>
			<PartnerDirectory selectedSection={ selectedSection } />
		</>
	);
	context.secondary = <PartnerDirectorySideBar path={ context.path } />;
	next();
};
