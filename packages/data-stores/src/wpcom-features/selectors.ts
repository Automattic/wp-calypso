/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { featuresList } from './features-data';

export const getSelectedFeatures = ( state: State ) => state;
export const getAllFeatures = () => featuresList;
