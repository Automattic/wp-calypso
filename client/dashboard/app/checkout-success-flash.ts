import { getPlanNames } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';

/**
 * The toast for an order that included `planSlug`, or undefined when the slug
 * isn't a known plan. The slug comes from the URL, so only own keys count.
 */
export function getPlanActivatedMessage( planSlug: string | null ): string | undefined {
	const planNames: Record< string, string > = getPlanNames();
	if ( ! planSlug || ! Object.hasOwn( planNames, planSlug ) ) {
		return undefined;
	}
	return sprintf(
		/* translators: %(planName)s is the name of the plan, e.g. "Business" */
		__( "You're in! The %(planName)s Plan is now active." ),
		{ planName: planNames[ planSlug ] }
	);
}
