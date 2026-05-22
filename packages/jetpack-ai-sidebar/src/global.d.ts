/**
 * Global data injected by the Agents Manager host script.
 */
declare const agentsManagerData:
	| {
			aiEditorialReviewEnabled?: boolean;
			reviewMediatorEnabled?: boolean;
			jetpackAiSidebarPreview?: {
				enabled: boolean;
				features?: {
					aiEditorialReview?: boolean;
					blockTransformations?: boolean;
					optimizeTitleSuggestion?: boolean;
					chatHistory?: boolean;
					supportGuides?: boolean;
				};
			};
	  }
	| undefined;
