import {
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteSlug, SiteId } from 'calypso/types';

interface Response {
	blog_id: SiteId;
	eligible: boolean;
	message: string;
}

const useCheckTrialPlanEligibility = (
	siteSlug: SiteId | SiteSlug,
	productSlug: string
): UseQueryResult< Response > => {
	return useQuery( {
		queryKey: [ 'check_eligibility_wp_bundle_trial_monthly', siteSlug, productSlug ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteSlug }/hosting/trial/check-eligibility/${ productSlug }`,
				apiNamespace: 'wpcom/v2',
			} ),
	} );
};

const useCheckMigrationTrialPlanEligibility = (
	siteSlug: SiteId | SiteSlug
): UseQueryResult< Response > => {
	return useCheckTrialPlanEligibility( siteSlug, PLAN_MIGRATION_TRIAL_MONTHLY );
};

const useCheckHostingTrialPlanEligibility = (
	siteSlug: SiteId | SiteSlug
): UseQueryResult< Response > => {
	return useCheckTrialPlanEligibility( siteSlug, PLAN_HOSTING_TRIAL_MONTHLY );
};

export { useCheckMigrationTrialPlanEligibility, useCheckHostingTrialPlanEligibility };
