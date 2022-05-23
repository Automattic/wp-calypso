import type { Category, DesignRecipe } from '@automattic/design-picker';

export interface StarterDesignsGenerated {
	slug: string;
	title: string;
	category: Category;
	recipe: DesignRecipe;
}
