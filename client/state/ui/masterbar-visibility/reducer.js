/**
 * Internal dependencies
 */
import { MASTERBAR_TOGGLE_VISIBILITY } from 'state/action-types';

export default ( state = true, { type, isVisible } ) =>
	type === MASTERBAR_TOGGLE_VISIBILITY ? isVisible : state;
