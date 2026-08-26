/**
 * Prototype-only license/purchase data, shaped after the `/jetpack-licensing/licenses`
 * response (see APILicense in client/a8c-for-agencies/data/purchases/lib/format-licenses.ts),
 * so it can be replaced by an @automattic/api-queries factory without reshaping the UI.
 *
 * Product names, statuses, and the assigned/unassigned model mirror production. All
 * prices are placeholders pending real Billing Dragon data and are labelled as such
 * wherever they surface in the UI.
 */

export type LicenseStatus = 'assigned' | 'unassigned' | 'revoked';

export interface AgencyLicense {
	licenseId: number;
	licenseKey: string;
	product: string;
	productId: number;
	siteUrl: string | null;
	blogId: number | null;
	status: LicenseStatus;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
	quantity: number;
	hasDownloads: boolean;
	/** Mock subscription pricing, mirrors APILicenseSubscription. */
	subscription: {
		productName: string;
		/** Integer amount in the currency's smallest unit (cents). Mock value. */
		purchasePrice: number;
		purchaseCurrency: string;
		billingIntervalUnit: 'month' | 'year';
		isAutoRenewEnabled: boolean;
	} | null;
}

export const MOCK_CURRENCY = 'USD';

/**
 * Placeholder monthly prices, in cents. Not real Billing Dragon figures.
 */
const MOCK_PRICES: Record< string, number > = {
	'jetpack-backup-t1': 4795,
	'jetpack-security-t1': 11983,
	'jetpack-complete': 59976,
	'jetpack-anti-spam': 815,
	'jetpack-scan': 4795,
	'jetpack-videopress': 4795,
	'jetpack-boost': 799,
	'woocommerce-subscriptions': 1499,
	'wpcom-hosting-business': 2500,
};

function subscriptionFor(
	slug: string,
	productName: string,
	autoRenew = true
): AgencyLicense[ 'subscription' ] {
	return {
		productName,
		purchasePrice: MOCK_PRICES[ slug ] ?? 0,
		purchaseCurrency: MOCK_CURRENCY,
		billingIntervalUnit: 'month',
		isAutoRenewEnabled: autoRenew,
	};
}

export const mockLicenses: AgencyLicense[] = [
	{
		licenseId: 90211,
		licenseKey: 'jetpack-backup-t1_MOCKa1B2c3D4e5F6',
		product: 'Jetpack VaultPress Backup (10GB)',
		productId: 2100,
		siteUrl: 'northwind-studio.com',
		blogId: 210998001,
		status: 'assigned',
		issuedAt: '2026-08-18T09:12:00+00:00',
		attachedAt: '2026-08-18T09:20:00+00:00',
		revokedAt: null,
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-backup-t1', 'Jetpack VaultPress Backup (10GB)' ),
	},
	{
		licenseId: 90212,
		licenseKey: 'jetpack-security-t1_MOCKg7H8i9J0k1L2',
		product: 'Jetpack Security (10GB)',
		productId: 2101,
		siteUrl: 'meridian-bakery.com',
		blogId: 210998002,
		status: 'assigned',
		issuedAt: '2026-08-14T14:03:00+00:00',
		attachedAt: '2026-08-15T08:41:00+00:00',
		revokedAt: null,
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-security-t1', 'Jetpack Security (10GB)' ),
	},
	{
		licenseId: 90213,
		licenseKey: 'jetpack-complete_MOCKm3N4o5P6q7R8',
		product: 'Jetpack Complete',
		productId: 2014,
		siteUrl: null,
		blogId: null,
		status: 'unassigned',
		issuedAt: '2026-08-21T11:47:00+00:00',
		attachedAt: null,
		revokedAt: null,
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-complete', 'Jetpack Complete' ),
	},
	{
		licenseId: 90214,
		licenseKey: 'jetpack-anti-spam_MOCKs9T0u1V2w3X4',
		product: 'Jetpack Anti-spam',
		productId: 2110,
		siteUrl: 'harbor-legal.com',
		blogId: 210998003,
		status: 'assigned',
		issuedAt: '2026-07-30T16:22:00+00:00',
		attachedAt: '2026-07-30T16:30:00+00:00',
		revokedAt: null,
		quantity: 1,
		hasDownloads: false,
		subscription: subscriptionFor( 'jetpack-anti-spam', 'Jetpack Anti-spam' ),
	},
	{
		licenseId: 90215,
		licenseKey: 'jetpack-scan_MOCKy5Z6a7B8c9D0',
		product: 'Jetpack Scan',
		productId: 2106,
		siteUrl: null,
		blogId: null,
		status: 'unassigned',
		issuedAt: '2026-08-22T08:05:00+00:00',
		attachedAt: null,
		revokedAt: null,
		quantity: 5,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-scan', 'Jetpack Scan' ),
	},
	{
		licenseId: 90216,
		licenseKey: 'jetpack-videopress_MOCKe1F2g3H4i5J6',
		product: 'Jetpack VideoPress',
		productId: 2115,
		siteUrl: 'cascade-films.com',
		blogId: 210998004,
		status: 'assigned',
		issuedAt: '2026-06-11T10:00:00+00:00',
		attachedAt: '2026-06-12T09:15:00+00:00',
		revokedAt: null,
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-videopress', 'Jetpack VideoPress' ),
	},
	{
		licenseId: 90217,
		licenseKey: 'jetpack-boost_MOCKk7L8m9N0o1P2',
		product: 'Jetpack Boost',
		productId: 2119,
		siteUrl: null,
		blogId: null,
		status: 'unassigned',
		issuedAt: '2026-08-25T13:38:00+00:00',
		attachedAt: null,
		revokedAt: null,
		quantity: 1,
		hasDownloads: false,
		subscription: subscriptionFor( 'jetpack-boost', 'Jetpack Boost' ),
	},
	{
		licenseId: 90218,
		licenseKey: 'woocommerce-subscriptions_MOCKq3R4s5T6u7V8',
		product: 'WooCommerce Subscriptions',
		productId: 3050,
		siteUrl: 'meridian-bakery.com',
		blogId: 210998002,
		status: 'assigned',
		issuedAt: '2026-05-02T12:10:00+00:00',
		attachedAt: '2026-05-02T12:44:00+00:00',
		revokedAt: null,
		quantity: 1,
		hasDownloads: false,
		subscription: subscriptionFor( 'woocommerce-subscriptions', 'WooCommerce Subscriptions' ),
	},
	{
		licenseId: 90219,
		licenseKey: 'jetpack-backup-t1_MOCKw9X0y1Z2a3B4',
		product: 'Jetpack VaultPress Backup (10GB)',
		productId: 2100,
		siteUrl: 'aspen-clinic.com',
		blogId: 210998005,
		status: 'revoked',
		issuedAt: '2026-03-19T09:00:00+00:00',
		attachedAt: '2026-03-20T09:00:00+00:00',
		revokedAt: '2026-07-14T17:25:00+00:00',
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-backup-t1', 'Jetpack VaultPress Backup (10GB)', false ),
	},
	{
		licenseId: 90220,
		licenseKey: 'jetpack-security-t1_MOCKc5D6e7F8g9H0',
		product: 'Jetpack Security (10GB)',
		productId: 2101,
		siteUrl: null,
		blogId: null,
		status: 'revoked',
		issuedAt: '2026-04-08T15:44:00+00:00',
		attachedAt: null,
		revokedAt: '2026-06-01T11:00:00+00:00',
		quantity: 1,
		hasDownloads: true,
		subscription: subscriptionFor( 'jetpack-security-t1', 'Jetpack Security (10GB)', false ),
	},
];

/**
 * Stand-in for an @automattic/api-queries factory. Resolves after a tick so the
 * DataViews loading state is exercised, matching how the real query would behave.
 */
export function fetchAgencyLicenses(): Promise< AgencyLicense[] > {
	return new Promise( ( resolve ) => {
		setTimeout( () => resolve( mockLicenses ), 400 );
	} );
}
