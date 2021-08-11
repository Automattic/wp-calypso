import React from 'react';
import { useDispatch } from 'react-redux';
import { requestOrganizations } from 'calypso/state/reader/organizations/actions';

export default function QueryReaderOrganizations() {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestOrganizations() );
	}, [ dispatch ] );

	return null;
}
