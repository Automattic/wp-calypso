import { Metrics } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';

export type Valuation = 'good' | 'needsImprovement' | 'bad';

export const metricsNames: Record< Metrics, { name: string; shortName: string } > = {
	overall_score: { name: __( 'Performance Score' ), shortName: __( 'Score' ) },
	fcp: { name: __( 'First Contentful Paint' ), shortName: __( 'FCP' ) },
	lcp: { name: __( 'Largest Contentful Paint' ), shortName: __( 'LCP' ) },
	cls: { name: __( 'Cumulative Layout Shift' ), shortName: __( 'CLS' ) },
	inp: { name: __( 'Interaction to Next Paint' ), shortName: __( 'INP' ) },
	ttfb: { name: __( 'Time to First Byte' ), shortName: __( 'TTFB' ) },
	tbt: { name: __( 'Total Blocking Time' ), shortName: __( 'TBT' ) },
};
// bad values are only needed as a maximum value on the scales
export const metricsThresholds: Record<
	Metrics,
	{ good: number; needsImprovement: number; bad: number }
> = {
	lcp: {
		good: 2500,
		needsImprovement: 4000,
		bad: 6000,
	},
	cls: {
		good: 0.1,
		needsImprovement: 0.25,
		bad: 0.4,
	},
	fcp: {
		good: 1800,
		needsImprovement: 3000,
		bad: 5000,
	},
	ttfb: {
		good: 800,
		needsImprovement: 1800,
		bad: 3000,
	},
	inp: {
		good: 200,
		needsImprovement: 500,
		bad: 1000,
	},
	tbt: {
		good: 200,
		needsImprovement: 600,
		bad: 1000,
	},
	overall_score: {
		good: 100,
		needsImprovement: 89,
		bad: 49,
	},
};

export const getPerformanceStatus = ( value: number ): Valuation => {
	if ( value <= 0.49 ) {
		return 'bad';
	} else if ( value > 0.49 && value < 0.9 ) {
		return 'needsImprovement';
	}
	return 'good';
};

export const mapThresholdsToStatus = ( metric: Metrics, value: number ): Valuation => {
	const { good, needsImprovement } = metricsThresholds[ metric ];

	if ( metric === 'overall_score' ) {
		return getPerformanceStatus( value );
	}
	if ( value <= good ) {
		return 'good';
	}

	if ( value <= needsImprovement ) {
		return 'needsImprovement';
	}

	return 'bad';
};

export const getColorForStatus = ( status: Valuation ): string => {
	if ( status === 'bad' ) {
		return 'var(--dashboard__foreground-color-error)';
	}
	if ( status === 'needsImprovement' ) {
		return 'var(--dashboard__foreground-color-warning)';
	}
	return 'var(--dashboard__foreground-color-success)';
};

export const getStatusText = ( status: Valuation ): string => {
	const statusMap: Record< Valuation, string > = {
		bad: __( 'Poor' ),
		needsImprovement: __( 'Needs improvement' ),
		good: __( 'Excellent' ),
	};

	return statusMap[ status ];
};

export const getStatusIntent = ( status: Valuation ): 'error' | 'warning' | 'success' => {
	const statusMap: Record< Valuation, 'error' | 'warning' | 'success' > = {
		bad: 'error',
		needsImprovement: 'warning',
		good: 'success',
	};

	return statusMap[ status ];
};

export const getDisplayUnit = ( metric: Metrics ) => {
	if ( [ 'lcp', 'fcp', 'ttfb', 'inp', 'tbt' ].includes( metric ) ) {
		return 's';
	}

	return '';
};

const max2Decimals = ( val: number ) => Number( Number( val ).toFixed( 2 ) );

export const getFormattedValue = ( metric: Metrics, value: number ): number => {
	if ( value === null || value === undefined ) {
		return 0;
	}

	if ( metric === 'overall_score' ) {
		return Math.floor( value );
	}

	if ( [ 'lcp', 'fcp', 'ttfb', 'inp', 'tbt' ].includes( metric ) ) {
		return max2Decimals( value / 1000 );
	}

	return max2Decimals( value );
};

export const getDisplayValue = ( metric: Metrics, value: number ): string => {
	if ( value === null || value === undefined ) {
		return '';
	}

	return [ getFormattedValue( metric, value ), getDisplayUnit( metric ) ].join( '' );
};
