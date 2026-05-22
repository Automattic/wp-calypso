type JetpackAiSidebarPreviewFeature =
	| 'aiEditorialReview'
	| 'blockTransformations'
	| 'optimizeTitleSuggestion'
	| 'chatHistory'
	| 'supportGuides';

function getJetpackAiSidebarPreview() {
	return typeof agentsManagerData !== 'undefined'
		? agentsManagerData?.jetpackAiSidebarPreview
		: undefined;
}

export function isJetpackAiSidebarPreviewFeatureEnabled(
	feature: JetpackAiSidebarPreviewFeature,
	defaultValue = true
): boolean {
	const preview = getJetpackAiSidebarPreview();
	if ( ! preview ) {
		return defaultValue;
	}
	if ( ! preview.enabled ) {
		return false;
	}
	return preview.features?.[ feature ] === true;
}
