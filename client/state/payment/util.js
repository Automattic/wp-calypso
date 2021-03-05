/**
 * External dependencies
 */
import { find, get } from 'lodash';

export const extractStoredCardMetaValue = ( action, meta_key ) =>
	( find( get( action, 'payment.storedCard.meta' ), { meta_key } ) || {} ).meta_value;
