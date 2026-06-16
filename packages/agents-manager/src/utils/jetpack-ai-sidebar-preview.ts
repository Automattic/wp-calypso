type JetpackAiSidebarPreviewFeature =
	| 'aiEditorialReview'
	| 'generateFeedback'
	| 'blockTransformations'
	| 'optimizeTitleSuggestion'
	| 'chatHistory'
	| 'supportGuides';

function getAgentsManagerData() {
	return typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
}

export function isJetpackAiSidebarPreviewFeatureEnabled(
	feature: JetpackAiSidebarPreviewFeature,
	defaultValue: boolean
): boolean {
	const preview = getAgentsManagerData()?.jetpackAiSidebarPreview;
	if ( ! preview ) {
		return defaultValue;
	}
	if ( ! preview.enabled ) {
		return false;
	}
	return preview.features?.[ feature ] === true;
}
