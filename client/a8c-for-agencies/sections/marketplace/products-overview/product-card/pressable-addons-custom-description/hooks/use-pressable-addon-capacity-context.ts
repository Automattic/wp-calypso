import { formatNumber } from '@automattic/number-formatters';
import { useMemo } from 'react';
import useGetPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-get-pressable-plan';

export type PressableAddonType = 'sites' | 'storage' | 'visits' | 'phpMemory' | 'unknown';

export type PressableAddonCapacityCopyContext = {
	type: PressableAddonType;
	install: number;
	storage: number;
	visits: number;
	phpMemory: number;
	formattedInstall: string;
	formattedStorage: string;
	formattedVisits: string;
	formattedPhpMemory: string;
};

export function getPressableAddonType( productSlug: string ): PressableAddonType {
	if ( productSlug.startsWith( 'pressable-addon-sites-' ) ) {
		return 'sites';
	}

	if ( productSlug.startsWith( 'pressable-addon-storage-' ) ) {
		return 'storage';
	}

	if ( productSlug.startsWith( 'pressable-addon-visits-' ) ) {
		return 'visits';
	}

	if ( productSlug.startsWith( 'pressable-addon-php-memory-' ) ) {
		return 'phpMemory';
	}

	return 'unknown';
}

export default function usePressableAddonCapacityContext( productSlug: string ) {
	const getPressablePlan = useGetPressablePlan();
	const plan = getPressablePlan( productSlug );

	return useMemo( () => {
		if ( ! plan ) {
			return null;
		}
		const type = getPressableAddonType( productSlug );

		return {
			type,
			install: plan.install,
			storage: plan.storage,
			visits: plan.visits,
			phpMemory: plan.phpMemory ?? 0,
			formattedInstall: formatNumber( plan.install ),
			formattedStorage: `${ formatNumber( plan.storage ) } GB`,
			formattedVisits: formatNumber( plan.visits ),
			formattedPhpMemory: `${ formatNumber( plan.phpMemory ?? 0 ) } MB`,
		};
	}, [ plan, productSlug ] );
}
