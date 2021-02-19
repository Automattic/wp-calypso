/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';

interface Props {
	filter: LicenseFilter;
	search: string;
}

export default function QueryJetpackPartnerPortalLicenses( { filter, search }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchLicenses( filter, search ) );
	}, [ dispatch, filter, search ] );

	return null;
}
