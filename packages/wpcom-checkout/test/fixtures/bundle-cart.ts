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
				{
					uuid: 'primary',
					meta: 'example.com',
					item_subtotal_integer: 2200,
					item_original_subtotal_integer: 2200,
				},
				{ groupId: 'bundle-abc', role: 'primary', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{
					uuid: 'companion-net',
					meta: 'example.net',
					item_subtotal_integer: 1800,
					item_original_subtotal_integer: 1800,
				},
				{ groupId: 'bundle-abc', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{
					uuid: 'companion-org',
					meta: 'example.org',
					item_subtotal_integer: 2000,
					item_original_subtotal_integer: 2000,
				},
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

/**
 * Build a mock responseCart containing two distinct domain bundles interleaved
 * with a standalone domain registration, mirroring a multi-bundle cart from the
 * design mockups. The "thalasso" bundle holds .com/.org/.net and the "brimnir"
 * bundle holds .info/.co/.vip, with a standalone domain sitting between them.
 * @returns A ResponseCart with two bundle groups plus an ungrouped product.
 */
export function buildMultiBundleResponseCart(): ResponseCart {
	return {
		...getEmptyResponseCart(),
		products: [
			buildDomainProduct(
				{ uuid: 'thalasso-com', meta: 'thalasso.com', item_subtotal_integer: 2200 },
				{ groupId: 'bundle-thalasso', role: 'primary', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'thalasso-org', meta: 'thalasso.org', item_subtotal_integer: 2000 },
				{ groupId: 'bundle-thalasso', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'thalasso-net', meta: 'thalasso.net', item_subtotal_integer: 1800 },
				{ groupId: 'bundle-thalasso', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct( {
				uuid: 'standalone',
				meta: 'standalone.blog',
				item_subtotal_integer: 3000,
			} ),
			// The brimnir primary is deliberately listed last so ordering tests
			// exercise the primary-first reordering rather than the input order.
			buildDomainProduct(
				{ uuid: 'brimnir-co', meta: 'brimnir.co', item_subtotal_integer: 2500 },
				{ groupId: 'bundle-brimnir', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'brimnir-vip', meta: 'brimnir.vip', item_subtotal_integer: 4200 },
				{ groupId: 'bundle-brimnir', role: 'companion', expectedBundleSize: 3 }
			),
			buildDomainProduct(
				{ uuid: 'brimnir-info', meta: 'brimnir.info', item_subtotal_integer: 1500 },
				{ groupId: 'bundle-brimnir', role: 'primary', expectedBundleSize: 3 }
			),
		],
	};
}
