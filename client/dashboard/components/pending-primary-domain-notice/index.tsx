import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef } from 'react';
import { useAppContext } from '../../app/context';
import { hasCustomPrimaryDomain, isPendingPrimaryDomain } from '../../utils/domain';
import { Notice } from '../notice';

interface PendingPrimaryDomainNoticeProps {
	domainName: string;
	onComplete?: () => void;
}

export default function PendingPrimaryDomainNotice( {
	domainName,
	onComplete,
}: PendingPrimaryDomainNoticeProps ) {
	const { queries } = useAppContext();

	const { data: polledDomain } = useQuery( {
		...domainQuery( domainName ),
		refetchInterval: ( query ) => {
			const domain = query.state.data;
			return domain && isPendingPrimaryDomain( domain ) ? 5000 : false;
		},
		meta: { persist: false },
	} );

	// WordPress.com only sets a domain as primary on its own when the site has no
	// custom primary address yet.
	const { data: allDomains } = useQuery( {
		...queries.domainsQuery(),
		enabled: !! polledDomain,
	} );

	const isPending =
		!! polledDomain &&
		!! allDomains &&
		! hasCustomPrimaryDomain(
			allDomains.filter( ( domain ) => domain.blog_id === polledDomain.blog_id )
		) &&
		isPendingPrimaryDomain( polledDomain );

	// Track whether the domain was ever actually pending, so we don't fire
	// a spurious snackbar when rendered for a non-pending domain.
	const wasPendingRef = useRef( false );
	if ( isPending ) {
		wasPendingRef.current = true;
	}

	// Announce the domain only once it has actually become the primary address.
	// Setup finishing is not enough: the job promotes the domain on a later retry.
	const { createSuccessNotice } = useDispatch( noticesStore );
	const onCompleteRef = useRef( onComplete );
	onCompleteRef.current = onComplete;
	const isPrimary = !! polledDomain?.primary_domain;
	useEffect( () => {
		if ( isPrimary && wasPendingRef.current ) {
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
	}, [ isPrimary, createSuccessNotice, domainName ] );

	if ( ! isPending ) {
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
