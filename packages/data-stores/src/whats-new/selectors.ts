/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const isWhatsNewActive = ( state: State ) => state.guide.isActive;
