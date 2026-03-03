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
import PartnerDirectory from './partner-directory';

export const partnerDirectoryDashboardContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );

	const hasDirectoryApproval = agency?.profile?.partner_directory_application?.directories.some(
		( { status } ) => status === 'approved'
	);

	const validSections = [
		PARTNER_DIRECTORY_DASHBOARD_SLUG,
		// Agency details - only if agency has directory approval
		...( hasDirectoryApproval ? [ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG ] : [] ),
		PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
		// TODO: Lead matching is currently accessible to all agencies but should be gated
		// to only select pilot agencies before public launch. Add a feature flag or
		// agency-level permission check (e.g., agency.lead_matching_enabled) here.
		PARTNER_DIRECTORY_LEAD_MATCHING_SLUG,
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
