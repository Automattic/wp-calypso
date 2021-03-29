/**
 * Internal dependencies
 */
import rawAvailableDesignsConfig from '../available-designs-config.json';
import type { Design } from '../types';

export interface AvailableDesigns {
	featured: Design[];
}

export const availableDesignsConfig = rawAvailableDesignsConfig as Readonly< AvailableDesigns >;
