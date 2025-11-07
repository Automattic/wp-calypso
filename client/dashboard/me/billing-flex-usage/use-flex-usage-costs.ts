import { purchaseQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import type { Purchase } from '@automattic/api-core';

export type FlexUsageCostPart = {
	id: 'storage' | 'bandwidth' | 'compute';
	label: string;
	amount: number; // major currency units
};

export type FlexUsageCosts = {
	currency: string;
	total: number; // major currency units
	parts: FlexUsageCostPart[];
	formatted: {
		total: string;
		parts: Record< FlexUsageCostPart[ 'id' ], string >;
	};
};

type FlexPurchaseWithCosts = Purchase & {
	flex_storage_cost?: number;
	flex_bandwidth_cost?: number;
	flex_compute_cost?: number;
};

function makeEmpty( currency: string = 'USD' ): FlexUsageCosts {
	const parts: FlexUsageCostPart[] = [
		{ id: 'storage', label: 'Storage', amount: 0 },
		{ id: 'bandwidth', label: 'Bandwidth', amount: 0 },
		{ id: 'compute', label: 'Compute', amount: 0 },
	];
	return {
		currency,
		total: 0,
		parts,
		formatted: {
			total: formatCurrency( 0, currency ),
			parts: {
				storage: formatCurrency( 0, currency ),
				bandwidth: formatCurrency( 0, currency ),
				compute: formatCurrency( 0, currency ),
			},
		},
	};
}

/**
 * useFlexUsageCosts
 *
 * Temporary hook that returns the current month Flex usage costs. Until the
 * upgrades endpoint exposes per-resource usage costs on the Flex purchase,
 * this hook returns placeholders while keeping the final API shape stable.
 *
 * Once available, replace the placeholder extraction with fields from the
 * Flex purchase (e.g. `flex_storage_cost`, `flex_bandwidth_cost`,
 * `flex_compute_cost`).
 */
export function useFlexUsageCosts( purchaseId?: number | string ): FlexUsageCosts {
	const pidNum = typeof purchaseId === 'string' ? Number( purchaseId ) : purchaseId;
	const { data: purchase } = useQuery( {
		...purchaseQuery( pidNum as number ),
		enabled: Number.isFinite( pidNum ) && ( pidNum as number ) > 0,
	} );

	if ( ! purchase ) {
		return makeEmpty( 'USD' );
	}

	const currencyFromPurchase = purchase.currency_code ?? 'USD';
	const flexPurchase = purchase as FlexPurchaseWithCosts;

	// Placeholders until the endpoint is wired
	const storage = flexPurchase.flex_storage_cost ?? 0;
	const bandwidth = flexPurchase.flex_bandwidth_cost ?? 0;
	const compute = flexPurchase.flex_compute_cost ?? 0;
	const currency = currencyFromPurchase;

	const parts: FlexUsageCostPart[] = [
		{ id: 'storage', label: 'Storage', amount: storage },
		{ id: 'bandwidth', label: 'Bandwidth', amount: bandwidth },
		{ id: 'compute', label: 'Compute', amount: compute },
	];

	const total = parts.reduce( ( acc, p ) => acc + p.amount, 0 );

	const formattedParts = {
		storage: formatCurrency( parts[ 0 ].amount, currency ),
		bandwidth: formatCurrency( parts[ 1 ].amount, currency ),
		compute: formatCurrency( parts[ 2 ].amount, currency ),
	} as const;

	return {
		currency,
		total,
		parts,
		formatted: {
			total: formatCurrency( total, currency ),
			parts: {
				storage: formattedParts.storage,
				bandwidth: formattedParts.bandwidth,
				compute: formattedParts.compute,
			},
		},
	};
}
