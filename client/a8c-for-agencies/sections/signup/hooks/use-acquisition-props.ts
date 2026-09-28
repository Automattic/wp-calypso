import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

const ACQUISITION_QUERY_PARAMS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'ref',
];

/**
 * Acquisition query params from the signup URL, shaped as Tracks event properties.
 * Keys are omitted entirely when unset so we never record empty values.
 */
export default function useAcquisitionProps(): Record< string, string > {
	const queryArgs = useSelector( getCurrentQueryArguments );

	return useMemo(
		() =>
			ACQUISITION_QUERY_PARAMS.reduce< Record< string, string > >( ( props, key ) => {
				const value = queryArgs?.[ key ];
				if ( typeof value === 'string' && value !== '' ) {
					props[ key ] = value;
				}
				return props;
			}, {} ),
		[ queryArgs ]
	);
}
