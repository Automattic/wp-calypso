import { AnalyzeColorsResponse } from './types';

export const analyzeColors = ( url: string ) => ( {
	type: 'ANALYZE_COLORS' as const,
	url,
} );

export const receiveColors = ( data: AnalyzeColorsResponse ) => {
	return {
		type: 'ANALYZE_COLORS_RECEIVED' as const,
		data,
	};
};

export const receiveColorsFailed = ( url: string ) => {
	return {
		type: 'ANALYZE_COLORS_FAILED' as const,
		url,
	};
};

export type AnalyzerActions = ReturnType<
	typeof analyzeColors | typeof receiveColors | typeof receiveColorsFailed
>;
