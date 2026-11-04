import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef } from 'react';
import { isPendingPrimaryDomain } from '../../utils/domain';
import { Notice } from '../notice';

interface PendingPrimaryDomainNoticeProps {
	domainName: string;
	onComplete?: () => void;
}

/**
 * Polls a domain while the backend makes it the site's primary address, and
 * shows a snackbar once it is done.
 */
export function usePendingPrimaryDomain( domainName?: string, onComplete?: () => void ) {
	const { data: polledDomain } = useQuery( {
		...domainQuery( domainName ?? '' ),
		enabled: !! domainName,
		refetchInterval: ( query ) => {
			const domain = query.state.data;
			return domain && isPendingPrimaryDomain( domain ) ? 5000 : false;
		},
		meta: { persist: false },
	} );

	const isPending = !! domainName && ( ! polledDomain || isPendingPrimaryDomain( polledDomain ) );

	// Track whether the domain was ever actually pending, so we don't fire
	// a spurious snackbar when rendered for a non-pending domain.
	const wasPendingRef = useRef( false );
	if ( isPending && polledDomain ) {
		wasPendingRef.current = true;
	}

	const { createSuccessNotice } = useDispatch( noticesStore );
	const onCompleteRef = useRef( onComplete );
	onCompleteRef.current = onComplete;
	useEffect( () => {
		if ( domainName && ! isPending && wasPendingRef.current ) {
			wasPendingRef.current = false;
			createSuccessNotice(
				sprintf(
					/* translators: %s is the domain name */
					__( '%s is now your site’s primary address.' ),
					domainName
				),
				{ type: 'snackbar' }
			);
			onCompleteRef.current?.();
		}
	}, [ isPending, createSuccessNotice, domainName ] );

	return { isPending, polledDomain };
}

export default function PendingPrimaryDomainNotice( {
	domainName,
	onComplete,
}: PendingPrimaryDomainNoticeProps ) {
	const { isPending, polledDomain } = usePendingPrimaryDomain( domainName, onComplete );

	if ( ! isPending || ! polledDomain ) {
		return null;
	}

	return (
		<Notice variant="info" title={ __( 'Setting up your custom domain' ) }>
			{ createInterpolateElement(
				__(
					'We’re preparing <domain/> to be your site’s <strong>primary address</strong>. This usually takes a few moments, but can sometimes take up to 15 minutes.'
				),
				{
					domain: <strong>{ domainName }</strong>,
					strong: <strong />,
				}
			) }
		</Notice>
	);
}
