import { __, sprintf } from '@wordpress/i18n';
import type { NoticeConfig } from '@automattic/agenttic-ui';

function isNonNegativeInteger( value: unknown ): value is number {
	return typeof value === 'number' && Number.isSafeInteger( value ) && value >= 0;
}

export function getWpcomCreditPreviewNotice(
	aiCredits: unknown,
	siteId: number | undefined
): NoticeConfig | undefined {
	if (
		! isNonNegativeInteger( siteId ) ||
		siteId === 0 ||
		! aiCredits ||
		typeof aiCredits !== 'object' ||
		Array.isArray( aiCredits )
	) {
		return undefined;
	}

	const snapshot = aiCredits as Record< string, unknown >;
	const limit = snapshot.credits_limit;
	const used = snapshot.credits_used;
	const remaining = snapshot.credits_remaining;
	const resetsAt = snapshot.resets_at;
	if (
		snapshot.schema_version !== 1 ||
		snapshot.policy_id !== 'wpcom-site-monthly-v1' ||
		snapshot.cost_version !== 'provider-cost-v1' ||
		snapshot.accounting_mode !== 'provider_cost' ||
		snapshot.reason !== 'wpcom_site_plan' ||
		snapshot.blog_id !== siteId ||
		snapshot.eligible !== true ||
		snapshot.preview !== true ||
		snapshot.blocked !== false ||
		! isNonNegativeInteger( limit ) ||
		limit === 0 ||
		! isNonNegativeInteger( used ) ||
		! isNonNegativeInteger( remaining ) ||
		remaining !== Math.max( 0, limit - used ) ||
		snapshot.exhausted !== ( remaining === 0 ) ||
		typeof resetsAt !== 'string' ||
		! /^\d{4}-\d{2}-01T00:00:00(?:Z|\+00:00)$/.test( resetsAt )
	) {
		return undefined;
	}

	const resetDate = new Date( resetsAt );
	if (
		Number.isNaN( resetDate.getTime() ) ||
		resetDate.toISOString().slice( 0, 10 ) !== resetsAt.slice( 0, 10 )
	) {
		return undefined;
	}

	const percentage = Math.floor( ( 100 * remaining ) / limit );
	const remainingPercentage = remaining > 0 && percentage === 0 ? '<1%' : `${ percentage }%`;
	return {
		message: sprintf(
			/* translators: %s is the percentage of credits remaining, including the percent sign. */
			__( '%s credits left', __i18n_text_domain__ ),
			remainingPercentage
		),
		dismissible: false,
		...( remaining === 0 && { status: 'warning' as const } ),
	};
}
