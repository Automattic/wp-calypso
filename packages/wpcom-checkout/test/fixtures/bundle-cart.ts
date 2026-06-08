import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import type {
	DomainBundleRole,
	ResponseCart,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

/**
 * Build a single domain cart product for bundle-grouping fixtures.
 * @param overrides Fields to override on the empty product (uuid, meta, etc.).
 * @param bundle Optional bundle metadata written into `extra`.
 * @param bundle.groupId The shared bundle group id.
 * @param bundle.role This product's role within the bundle.
 * @param bundle.expectedBundleSize Expected member count (defaults to 2).
 * @returns A ResponseCartProduct shaped like a domain registration line item.
 */
export function buildDomainProduct(
	overrides: Partial< ResponseCartProduct > = {},
	bundle?: {
		groupId: string;
		role: DomainBundleRole;
		expectedBundleSize?: number;
	}
): ResponseCartProduct {
	return {
		...getEmptyResponseCartProduct(),
		product_slug: 'domain_reg',
		is_domain_registration: true,
		...overrides,
		extra: {
			...overrides.extra,
			...( bundle && {
				domain_bundle_group_id: bundle.groupId,
				domain_bundle_role: bundle.role,
				expected_bundle_size: String( bundle.expectedBundleSize ?? 2 ),
			} ),
		},
	};
}

/**
 * Build a mock responseCart containing a three-domain bundle plus an unrelated,
 * ungrouped product. Used by the grouping helper and line-item render tests.
 * @returns A ResponseCart with bundle-tagged and untagged products.
 */
export function buildBundleResponseCart(): ResponseCart {
	return {
		...getEmptyResponseCart(),
		products: [
			buildDomainProduct(
				{ uuid: 'primary', meta: 'example.com', item_subtotal_integer: 2200 },
				{ groupId: 'bundle-abc', role: 'primary', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'companion-net', meta: 'example.net', item_subtotal_integer: 1800 },
				{ groupId: 'bundle-abc', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'companion-org', meta: 'example.org', item_subtotal_integer: 2000 },
				{ groupId: 'bundle-abc', role: 'companion', expectedBundleSize: 3 }
			),
			{
				...getEmptyResponseCartProduct(),
				uuid: 'plan',
				product_slug: 'value_bundle',
				product_name: 'WordPress.com Explorer',
				item_subtotal_integer: 9600,
			},
		],
	};
}
