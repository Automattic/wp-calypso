/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

export function isShowingCartOnMobile( state ) {
	return state.ui.checkout.isShowingCartOnMobile;
}
