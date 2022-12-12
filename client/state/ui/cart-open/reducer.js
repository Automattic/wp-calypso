import { JETPACK_CLOUD_CART_TOGGLE } from 'calypso/state/action-types';

export default ( state = false, { type, isOpen } ) =>
	type === JETPACK_CLOUD_CART_TOGGLE ? isOpen : state;
