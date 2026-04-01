import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef, useState } from 'react';
import { isPendingPrimaryDomain } from '../../utils/domain';

interface UsePendingPrimaryDomainOptions {
	onComplete?: () => void;
}

/**
 * Polls a single domain while it is pending primary status, and shows a
 * snackbar when setup completes.
 * @param domainName The domain to watch, or undefined to disable.
 * @param options Options object.
 * @param options.onComplete Called when the domain transitions from pending to primary.
 */
export function usePendingPrimaryDomain(
	domainName: string | undefined,
	{ onComplete }: UsePendingPrimaryDomainOptions = {}
) {
	const [ isDismissed, setIsDismissed ] = useState( false );

	// Reset dismissed state when the watched domain changes.
	useEffect( () => setIsDismissed( false ), [ domainName ] );

	const { data: polledDomain } = useQuery( {
		...domainQuery( domainName ?? '' ),
		enabled: !! domainName,
		refetchInterval: ( query ) => {
			const domain = query.state.data;
			return domain && isPendingPrimaryDomain( domain ) ? 5000 : false;
		},
		meta: { persist: false },
	} );

	const isPending = !! polledDomain && isPendingPrimaryDomain( polledDomain );

	// Show completion snackbar when primary domain setup finishes.
	// Store the domain name in a ref so it survives if the caller clears
	// `domainName` before this effect fires (e.g. list query refetch).
	const { createSuccessNotice } = useDispatch( noticesStore );
	const pendingNameRef = useRef< string | null >( null );
	const onCompleteRef = useRef( onComplete );
	onCompleteRef.current = onComplete;
	useEffect( () => {
		if ( pendingNameRef.current && ! isPending ) {
			createSuccessNotice(
				sprintf(
					/* translators: %s is the domain name */
					__( '%s is now your store’s primary address.' ),
					pendingNameRef.current
				),
				{ type: 'snackbar' }
			);
			onCompleteRef.current?.();
		}
		pendingNameRef.current = isPending && domainName ? domainName : null;
	}, [ isPending, createSuccessNotice, domainName ] );

	return {
		isPending,
		isDismissed,
		dismiss() {
			setIsDismissed( true );
		},
	};
}
