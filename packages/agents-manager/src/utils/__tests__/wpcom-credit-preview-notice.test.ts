import { getWpcomCreditPreviewNotice } from '../wpcom-credit-preview-notice';

const snapshot = {
	schema_version: 1,
	policy_id: 'wpcom-site-monthly-v1',
	cost_version: 'provider-cost-v1',
	accounting_mode: 'provider_cost',
	reason: 'wpcom_site_plan',
	blog_id: 123,
	eligible: true,
	preview: true,
	blocked: false,
	exhausted: false,
	credits_limit: 15_000,
	credits_used: 3_000,
	credits_remaining: 12_000,
	resets_at: '2026-10-01T00:00:00Z',
};

describe( 'getWpcomCreditPreviewNotice', () => {
	it( 'shows the remaining percentage with no purchase action', () => {
		expect( getWpcomCreditPreviewNotice( snapshot, 123 ) ).toEqual( {
			message: '80% credits left',
			dismissible: false,
		} );
	} );

	it( 'shows an exhausted preview without claiming that requests are blocked', () => {
		expect(
			getWpcomCreditPreviewNotice(
				{ ...snapshot, credits_used: 15_001, credits_remaining: 0, exhausted: true },
				123
			)
		).toEqual( {
			message: '0% credits left',
			dismissible: false,
			status: 'warning',
		} );
	} );

	it( 'keeps the percentage concise when the sandbox allowance check is enabled', () => {
		expect(
			getWpcomCreditPreviewNotice( { ...snapshot, enforcement: 'sandbox_allowance' }, 123 )
		).toEqual( {
			message: '80% credits left',
			dismissible: false,
		} );
	} );

	it.each( [
		[ 25_000, '100% credits left' ],
		[ 21_236, '84% credits left' ],
		[ 1, '<1% credits left' ],
	] )( 'formats %d remaining credits as %s', ( remaining, message ) => {
		expect(
			getWpcomCreditPreviewNotice(
				{
					...snapshot,
					credits_limit: 25_000,
					credits_used: 25_000 - remaining,
					credits_remaining: remaining,
				},
				123
			)
		).toEqual( { message, dismissible: false } );
	} );

	it( 'keeps blocked snapshots out of the preview notice', () => {
		expect(
			getWpcomCreditPreviewNotice(
				{ ...snapshot, enforcement: 'sandbox_allowance', blocked: true },
				123
			)
		).toBeUndefined();
	} );

	it.each( [ undefined, 0, 456 ] )(
		'hides another or unidentified site’s balance (%s)',
		( siteId ) => {
			expect( getWpcomCreditPreviewNotice( snapshot, siteId ) ).toBeUndefined();
		}
	);

	it.each( [
		{ schema_version: 2 },
		{ policy_id: 'jetpack-ai-self-hosted-monthly-v1' },
		{ cost_version: 'tokens-v1' },
		{ accounting_mode: 'requests' },
		{ reason: 'personal_credits' },
		{ eligible: false },
		{ preview: false },
		{ blocked: true },
		{ credits_limit: 0 },
		{ credits_used: -1 },
		{ credits_remaining: '12000' },
		{ credits_remaining: 15_000 },
		{ credits_used: Number.MAX_SAFE_INTEGER + 1 },
		{ exhausted: true },
		{ resets_at: '2026-10-01T00:00:00-06:00' },
		{ resets_at: '2026-10-02T00:00:00Z' },
		{ resets_at: '2026-13-01T00:00:00Z' },
	] )( 'hides an unsupported or inconsistent snapshot: %p', ( overrides ) => {
		expect( getWpcomCreditPreviewNotice( { ...snapshot, ...overrides }, 123 ) ).toBeUndefined();
	} );
} );
