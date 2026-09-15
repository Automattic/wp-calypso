import { useCallback, useEffect, useState } from '@wordpress/element';
import { getWpcomCreditPreviewNotice } from '../utils/wpcom-credit-preview-notice';

interface Options {
	scopeKey: string;
	siteId: number | undefined;
	enabled: boolean;
}

/**
 * Keeps the hosted credit notice tied to the current site and agent. Clear it
 * when that scope changes or a terminal response omits its credit snapshot.
 */
export function useWpcomCreditPreviewNotice( { scopeKey, siteId, enabled }: Options ) {
	const [ latestResult, setLatestResult ] = useState< {
		scopeKey: string;
		aiCredits: unknown;
	} >();

	useEffect( () => {
		setLatestResult( ( current ) =>
			enabled && current?.scopeKey === scopeKey ? current : undefined
		);
	}, [ scopeKey, enabled ] );

	const onTerminalResult = useCallback(
		( aiCredits: unknown ) => {
			if ( enabled ) {
				setLatestResult( { scopeKey, aiCredits } );
			}
		},
		[ scopeKey, enabled ]
	);

	const notice =
		enabled && latestResult?.scopeKey === scopeKey
			? getWpcomCreditPreviewNotice( latestResult.aiCredits, siteId )
			: undefined;

	return { notice, onTerminalResult };
}
