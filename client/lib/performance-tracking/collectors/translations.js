export const collectTranslationTimings = () => {
	const measures = window.performance?.getEntriesByName( 'add_translations' ) || [];
	const count = measures.length;
	const total = Math.round( measures.reduce( ( acc, measure ) => acc + measure.duration, 0 ) );
	return { count, total };
};

export const clearTranslationTimings = () => {
	window.performance?.clearMeasures( 'add_translations' );
};
