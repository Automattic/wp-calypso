import rawAvailableDesignsConfig from '../available-designs-config.json';
import type { Design } from '../types';

export interface AvailableDesigns {
	featured: Design[];
}

export const availableDesignsConfig = {
	...rawAvailableDesignsConfig,
	featured: rawAvailableDesignsConfig.featured.map( ( design ) => ( {
		...design,
		recipe: {
			stylesheet: `${ design.is_premium ? 'premium' : 'pub' }/${ design.theme }`,
		},
	} ) ),
} as Readonly< AvailableDesigns >;
