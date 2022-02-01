import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import isRequestingContactDetailsCache from 'calypso/state/selectors/is-requesting-contact-details-cache';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingContactDetailsCache( getState() ) ) {
		dispatch( requestContactDetailsCache() );
	}
};

function QueryContactDetailsCache() {
	const dispatch = useDispatch();
	const contactDetailsCache = useSelector( getContactDetailsCache );

	useEffect( () => {
		if ( isEmpty( contactDetailsCache ) ) {
			dispatch( request() );
		}
	}, [ dispatch, contactDetailsCache ] );

	return null;
}

export default QueryContactDetailsCache;
