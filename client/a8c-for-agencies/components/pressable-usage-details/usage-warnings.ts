export type PressableUsageWarningMetric = 'storage' | 'visits';

export type PressableUsageWarning = {
	metric: PressableUsageWarningMetric;
	addOnLabelKey: PressableUsageWarningMetric;
};

export function getPressableUsageWarning(
	metric: PressableUsageWarningMetric,
	used: number,
	total: number
): PressableUsageWarning | null {
	if ( used <= total ) {
		return null;
	}

	return {
		metric,
		addOnLabelKey: metric,
	};
}
