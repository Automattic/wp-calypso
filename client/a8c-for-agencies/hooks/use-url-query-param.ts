import { useCallback } from 'react';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';

export default function useUrlQueryParam( key: string ) {
	const { setParams, resetParams, getParamValue } = useURLQueryParams();

	const setValue = useCallback(
		( value: string ) => {
			if ( value ) {
				setParams( [
					{
						key: key,
						value,
					},
				] );
			} else {
				resetParams( [ key ] );
			}
		},
		[ key, resetParams, setParams ]
	);

	return {
		value: getParamValue( key ),
		setValue,
	};
}
