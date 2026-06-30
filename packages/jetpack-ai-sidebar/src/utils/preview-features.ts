type SidebarFeature =
	| 'aiEditorialReview'
	| 'generateFeedback'
	| 'blockTransformations'
	| 'blockToolbarButton'
	| 'optimizeTitleSuggestion'
	| 'seoSuggestions';

function getAgentsManagerData() {
	return typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
}

function getSidebarConfig() {
	return getAgentsManagerData()?.jetpackAiSidebar;
}

function isSidebarFeatureEnabled( feature: SidebarFeature, fallback: boolean ): boolean {
	const config = getSidebarConfig();
	if ( ! config ) {
		return fallback;
	}
	return config.enabled ? config.features?.[ feature ] === true : false;
}

export function isAiEditorialReviewEnabled(): boolean {
	return isSidebarFeatureEnabled( 'aiEditorialReview', false );
}

export function isOptimizeTitleSuggestionEnabled(): boolean {
	return isSidebarFeatureEnabled( 'optimizeTitleSuggestion', false );
}

/**
 * SEO Enhancer suggestions (SEO title / meta description) are gated by their own
 * flag, independent of Optimize Title — they target the SEO meta fields, not the
 * visible post title. The host (Jetpack) populates `features.seoSuggestions`.
 */
export function isSeoSuggestionsEnabled(): boolean {
	return isSidebarFeatureEnabled( 'seoSuggestions', false );
}

export function isBlockTransformationsEnabled(): boolean {
	return isSidebarFeatureEnabled( 'blockTransformations', true );
}

export function isGenerateFeedbackEnabled(): boolean {
	return isSidebarFeatureEnabled( 'generateFeedback', false );
}

export function isBlockToolbarButtonEnabled(): boolean {
	return isSidebarFeatureEnabled( 'blockToolbarButton', false );
}
