import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteSlug, SiteId } from 'calypso/types';

type ErrorCode =
	| 'invalid-plan-slug'
	| 'email-unverified'
	| 'has-had-business-trial'
	| 'existing-trial'
	| 'no-upgrades-permitted';

interface Response {
	blog_id: SiteId;
	eligible: boolean;
	error_code: ErrorCode;
	message: string;
}

const useCheckEligibilityMigrationTrialPlan = (
	siteSlug: SiteId | SiteSlug
): UseQueryResult< Response > => {
	return useQuery( {
		queryKey: [ 'check_eligibility_wp_bundle_migration_trial_monthly', siteSlug ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteSlug }/hosting/trial/check-eligibility/${ PLAN_MIGRATION_TRIAL_MONTHLY }`,
				apiNamespace: 'wpcom/v2',
			} ),
	} );
};

export default useCheckEligibilityMigrationTrialPlan;
