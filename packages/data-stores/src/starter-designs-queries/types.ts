import type { Category, Design } from '@automattic/design-picker/src/types';

export interface StarterDesigns {
	filters: { subject: Record< string, Category > };
	designs: Design[];
	recommendation: string[];
}
