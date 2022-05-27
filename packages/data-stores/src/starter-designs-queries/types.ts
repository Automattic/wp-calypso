import type { DesignRecipe } from '@automattic/design-picker/src/types';

export interface StarterDesignsGeneratedQueryParams {
	seed?: string;
}

export interface StarterDesignsGenerated {
	slug: string;
	title: string;
	recipe: DesignRecipe;
}
