type SidebarFeature =
	| 'aiEditorialReview'
	| 'generateFeedback'
	| 'blockTransformations'
	| 'blockToolbarButton'
	| 'optimizeTitleSuggestion';

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

export function isBlockTransformationsEnabled(): boolean {
	return isSidebarFeatureEnabled( 'blockTransformations', true );
}

export function isGenerateFeedbackEnabled(): boolean {
	return isSidebarFeatureEnabled( 'generateFeedback', false );
}

export function isBlockToolbarButtonEnabled(): boolean {
	return isSidebarFeatureEnabled( 'blockToolbarButton', false );
}
