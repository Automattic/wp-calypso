import type { Category, DesignRecipe } from '@automattic/design-picker/src/types';

export interface StarterDesignsGenerated {
	slug: string;
	title: string;
	category: Category;
	recipe: DesignRecipe;
}
