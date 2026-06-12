import { formatNumber } from '@automattic/number-formatters';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';

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

export function getPressableAddonCapacityCopyContext(
	productSlug: string
): PressableAddonCapacityCopyContext | null {
	const plan = getPressablePlan( productSlug );

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
}
