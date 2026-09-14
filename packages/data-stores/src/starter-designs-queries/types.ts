import type { Category, Design } from '@automattic/design-types';

export interface StarterDesigns {
	filters: { subject: Record< string, Category > };
	designs: Design[];
}
