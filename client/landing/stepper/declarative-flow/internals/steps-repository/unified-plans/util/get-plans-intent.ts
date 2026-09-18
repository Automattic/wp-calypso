import {
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_ONBOARDING_FLOW,
	EXAMPLE_FLOW,
	NEW_HOSTED_SITE_FLOW,
	NEWSLETTER_FLOW,
	ONBOARDING_FLOW,
	ONBOARDING_UNIFIED_FLOW,
	PLAN_UPGRADE_FLOW,
	WOO_HOSTED_PLANS_FLOW,
} from '@automattic/onboarding';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { playgroundPlansIntent } from '../../playground/lib/plans';
import { getVisualSplitPlansIntent } from './get-visual-split-plans-intent';
import type { PlansIntent } from '@automattic/plans-grid-next';

/**
 * Copied from steps-repository/plans (which should be removed)
 */
export function getPlansIntent( flowName: string | null ): PlansIntent | null {
	const search = new URLSearchParams( location.search );

	switch ( flowName ) {
		case NEWSLETTER_FLOW:
		case EXAMPLE_FLOW:
			return 'plans-newsletter';
		case NEW_HOSTED_SITE_FLOW:
			/**
			 * isWordCampPromo is temporary
			 */
			if ( search.has( 'utm_source', 'wordcamp' ) ) {
				return 'plans-new-hosted-site-business-only';
			}

			return 'plans-new-hosted-site';
		case AI_SITE_BUILDER_FLOW:
			return 'plans-ai-assembler-free-trial';
		case AI_SITE_BUILDER_ONBOARDING_FLOW:
			return 'plans-ai-assembler-paid-only';
		case ONBOARDING_FLOW:
			if ( search.has( 'playground' ) ) {
				return playgroundPlansIntent();
			}
			// WoW funnel: the site is always transferred to Atomic, so only plans that grant
			// the transfer make sense. Hide the free plan. Kept after the playground check so a
			// playground entry keeps its own intent.
			if ( search.has( 'wow_funnel' ) ) {
				return 'plans-ai-assembler-paid-only';
			}
			// Blueprint imports targeting Atomic (build_dest=wow) need a plan that
			// supports the transfer, so hide the free plan. Plain blueprint imports
			// build on a Simple site and keep the default grid.
			if ( search.has( 'blueprint' ) && search.get( 'build_dest' ) === 'wow' ) {
				return 'plans-ai-assembler-paid-only';
			}
			if ( search.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF ) {
				return 'plans-woo-hosting-solutions';
			}
			if ( search.has( 'intent' ) ) {
				return getVisualSplitPlansIntent( search.get( 'intent' )! );
			}
			break;
		case ONBOARDING_UNIFIED_FLOW:
			return 'plans-affiliate';
		case PLAN_UPGRADE_FLOW:
			return search.get( 'allow_downgrade' ) === 'true'
				? 'plans-upgrade-or-downgrade'
				: 'plans-upgrade';
		case WOO_HOSTED_PLANS_FLOW:
			return 'plans-woo-hosted';
		default:
			return null;
	}
	return null;
}
