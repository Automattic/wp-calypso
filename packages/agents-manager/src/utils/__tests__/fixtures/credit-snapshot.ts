import type { CreditSnapshot } from '../../live-credits';

// Allowance_Resolver + ai-agent.php at WPCOM 1db1db571509: the endpoint adds enforcement.
export const creditSnapshot = ( overrides: Partial< CreditSnapshot > = {} ): CreditSnapshot => ( {
	schema_version: 1,
	policy_id: 'wpcom-site-monthly-v1',
	cost_version: 'provider-cost-v1',
	accounting_mode: 'provider_cost',
	reason: 'wpcom_site_plan',
	eligible: true,
	preview: true,
	enforcement: 'site_allowance',
	blog_id: 123,
	credits_limit: 2500,
	credits_used: 50,
	credits_remaining: 2450,
	exhausted: false,
	blocked: false,
	resets_at: '2026-10-01T00:00:00Z',
	...overrides,
} );
