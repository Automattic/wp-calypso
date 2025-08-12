import { __ } from '@wordpress/i18n';

export function getPerformanceStatus( score: number ): 'poor' | 'neutral' | 'good' {
	if ( score <= 49 ) {
		return 'poor';
	} else if ( score < 90 ) {
		return 'neutral';
	}
	return 'good';
}

export function getPerformanceStatusText( status: 'poor' | 'neutral' | 'good' ) {
	return {
		poor: __( 'Poor' ),
		neutral: __( 'Needs improvement' ),
		good: __( 'Excellent' ),
	}[ status ];
}
