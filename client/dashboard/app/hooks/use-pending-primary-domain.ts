import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef, useState } from 'react';
import { isPendingPrimaryDomain } from '../../utils/domain';

/**
 * Polls a single domain while it is pending primary status, and shows a
 * snackbar when setup completes.
 * @param domainName The domain to watch, or undefined to disable.
 */
export function usePendingPrimaryDomain( domainName: string | undefined ) {
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
	const { createSuccessNotice } = useDispatch( noticesStore );
	const wasPendingRef = useRef( false );
	useEffect( () => {
		if ( wasPendingRef.current && ! isPending ) {
			createSuccessNotice(
				sprintf(
					/* translators: %s is the domain name */
					__( '%s is now your store\u2019s primary address.' ),
					domainName
				),
				{ type: 'snackbar' }
			);
		}
		wasPendingRef.current = isPending;
	}, [ isPending, createSuccessNotice, domainName ] );

	return {
		isPending,
		isDismissed,
		dismiss() {
			setIsDismissed( true );
		},
	};
}
