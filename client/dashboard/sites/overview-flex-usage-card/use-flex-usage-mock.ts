import { useMemo } from '@wordpress/element';

type UsageData = {
	storage: { usedBytes: number; capBytes: number };
	bandwidth: { usedBytes: number; capBytes: number };
	compute: { usedHours: number; capHours: number };
};

export function useFlexUsageMock( siteId: number ) {
	// Simple deterministic mock per siteId, so different sites vary but stay stable
	const data: UsageData = useMemo( () => {
		const seed = ( siteId % 97 ) + 1;
		const rand = ( n: number ) => ( ( ( seed * 9301 + 49297 ) % 233280 ) / 233280 ) * n;

		const storageCap = 1 * 1024 * 1024 * 1024; // 1 GB in bytes
		const bandwidthCap = 1 * 1024 * 1024 * 1024; // 1 GB in bytes (placeholder)
		const computeCap = 1; // 1 hr CPU (placeholder)

		const storageUsed = Math.min( storageCap, Math.floor( rand( storageCap * 0.9 ) ) );
		const bandwidthUsed = Math.min( bandwidthCap, Math.floor( rand( bandwidthCap * 0.9 ) ) );
		const computeUsed = Math.min( computeCap, Math.round( rand( computeCap * 0.9 ) * 10 ) / 10 );

		return {
			storage: { usedBytes: storageUsed, capBytes: storageCap },
			bandwidth: { usedBytes: bandwidthUsed, capBytes: bandwidthCap },
			compute: { usedHours: computeUsed, capHours: computeCap },
		};
	}, [ siteId ] );

	return { data };
}
