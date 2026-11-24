import config from '@automattic/calypso-config';
import {
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
} from '@automattic/calypso-products';
import { __ } from '@wordpress/i18n';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	!! platform &&
	platform !== 'wordpress' &&
	Boolean( from );

/**
 * Whether this run is a customer coming back from checkout without paying, for a new destination.
 * They get their site imported onto a free preview site, and pay to keep it.
 */
export const isCheckoutExitPreview = ( query: URLSearchParams ) =>
	query.get( 'checkoutExit' ) === '1' && ! query.get( 'siteId' ) && ! query.get( 'siteSlug' );

const PERSONAL_PLAN_SLUGS = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
];

/** The plans step for a static site import into a new destination, recommending Personal. */
export const getNewDestinationPlansProps = () => ( {
	isInSignup: true,
	intent: 'plans-default-wpcom' as const,
	hideFreePlan: true,
	hideEnterprisePlan: true,
	highlightLabelOverrides: Object.fromEntries(
		PERSONAL_PLAN_SLUGS.map( ( planSlug ) => [ planSlug, __( 'Recommended' ) ] )
	),
} );
