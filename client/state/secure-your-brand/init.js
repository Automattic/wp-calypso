/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import secureYourBrandReducer from './reducer';

export const secureYourBrand = 'secureYourBrand';

registerReducer( [ secureYourBrand ], secureYourBrandReducer );
