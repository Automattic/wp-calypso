import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';

export interface StarterDesignsGeneratedQueryParams {
	vertical_id: string;
	seed?: string;
	_locale: string;
}

export interface StarterDesignsGenerated {
	slug: string;
	title: string;
	recipe: DesignRecipe;
}

export interface AllStarterDesigns {
	generated: { designs: Design[] };
	static: { designs: Design[] };
}
