import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { ErrorNode, SiteError } from '../../types';

export default function useGetSiteErrors() {
	const translate = useTranslate();

	return useCallback(
		( error?: ErrorNode ): SiteError[] => {
			if ( error?.status === 'failed' ) {
				// FIXME: For the time being we only have one error type and that is network issue.
				return [ { severity: 'high', message: translate( 'Connectivity issue' ) } ];
			}

			return [];
		},
		[ translate ]
	);
}
