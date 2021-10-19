import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestLicenses } from 'calypso/state/user-licensing/actions';
import { getUserLicenses } from 'calypso/state/user-licensing/selectors';

export default function QueryJetpackUserLicenses(): null {
	const dispatch = useDispatch();
	const licenses = useSelector( getUserLicenses );

	useEffect( () => {
		if ( ! licenses ) {
			dispatch( requestLicenses() );
		}
	}, [ dispatch, licenses ] );

	return null;
}
