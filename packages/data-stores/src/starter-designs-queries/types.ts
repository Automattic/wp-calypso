import type { DesignRecipe } from '@automattic/design-picker/src/types';

export interface StarterDesignsGeneratedQueryParams {
	vertical_id: string;
	seed?: string;
}

export interface StarterDesignsGenerated {
	slug: string;
	title: string;
	recipe: DesignRecipe;
}
