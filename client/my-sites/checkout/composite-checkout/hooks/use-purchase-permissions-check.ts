import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function usePurchasePermissionsCheck() {
	const selectedSite = useSelector( getSelectedSite );
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const translate = useTranslate();
	const doesUserHavePermission = useSelector( ( state ) => {
		if ( cartKey ) {
			return true;
		}
		if ( ! selectedSite?.ID ) {
			return undefined;
		}
		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );
	useEffect( () => {
		if ( doesUserHavePermission === false ) {
			reduxDispatch(
				errorNotice( translate( 'You do not have permssion to make purchases on this site.' ) )
			);
		}
	}, [ reduxDispatch, translate, doesUserHavePermission ] );
}
