import type { Agency } from '@automattic/api-core';

// Old agencies didn't have approval_status set, so we need to account for that.
export const isAgencyApproved = ( agency?: Agency | null ) =>
	agency?.approval_status === 'approved' || agency?.approval_status === '';
