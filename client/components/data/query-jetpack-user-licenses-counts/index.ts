import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestLicensesCounts } from 'calypso/state/user-licensing/actions';
import { isFetchingUserLicensesCounts } from 'calypso/state/user-licensing/selectors';

export default function QueryJetpackUserLicenses(): null {
	const dispatch = useDispatch();
	const currentlyFetchingUserLicensesCounts = useSelector( isFetchingUserLicensesCounts );

	useEffect(
		() => {
			if ( ! currentlyFetchingUserLicensesCounts ) {
				dispatch( requestLicensesCounts() );
			}
		},
		// `currentlyFetchingUserLicensesCounts` is technically a dependency, but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[ dispatch ]
	);

	return null;
}
