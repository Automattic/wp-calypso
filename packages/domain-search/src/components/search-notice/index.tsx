import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useRef } from 'react';
import { isWpcomSubdomainQuery, stripWpcomSubdomainSuffix } from '../../helpers';
import { getAvailabilityNotice } from '../../helpers/get-availability-notice';
import { getRootDomain } from '../../helpers/get-root-domain';
import { isFqdnShownAsSuggestion } from '../../helpers/is-fqdn-shown-as-suggestion';
import { isSubdomainWithUnavailableRootDomain } from '../../helpers/is-subdomain-with-unavailable-root-domain';
import { isSupportedPremiumDomain } from '../../helpers/is-supported-premium-domain';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';

const AVAILABLE_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.AVAILABLE,
	DomainAvailabilityStatus.UNKNOWN,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
	// For domains that are transferrable (i.e. registered elsewhere and can be transferred to us), we want to show
	// only the "Already yours? Bring it over" notice instead of the availability notice
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
];

/**
 * Determines whether the availability notice should be hidden for a given domain availability.
 */
const shouldHideAvailabilityNotice = (
	availability: DomainAvailability,
	includeOwnedDomainInSuggestions: boolean
): boolean => {
	if ( AVAILABLE_DOMAIN_STATUSES.includes( availability.status ) ) {
		return true;
	}

	if (
		includeOwnedDomainInSuggestions &&
		availability.status === DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER
	) {
		return true;
	}

	if ( isSupportedPremiumDomain( availability ) ) {
		return true;
	}

	// We don't want to show the availability notice for *.wpcomstaging.com subdomains and other managed subdomains,
	// such as *.tech.blog, *.water.blog, etc.
	if (
		[
			DomainAvailabilityStatus.WPCOM_STAGING_DOMAIN,
			DomainAvailabilityStatus.DOTBLOG_SUBDOMAIN,
		].includes( availability.status )
	) {
		return true;
	}

	// *.wordpress.com and *.wp.com subdomains have `mappable = restricted`
	if ( availability.mappable === DomainAvailabilityStatus.RESTRICTED ) {
		return true;
	}

	return false;
};

const shouldReturnGenericMappedMessage = ( availability: DomainAvailability ): boolean => {
	const isDomainMapped = DomainAvailabilityStatus.MAPPED === availability.mappable;

	return (
		isDomainMapped &&
		availability.status !== DomainAvailabilityStatus.REGISTERED_SAME_SITE &&
		availability.status !== DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER &&
		availability.status !== DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE &&
		availability.status !== DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE
	);
};

const isConnectedToOtherAccount = ( availability: DomainAvailability ): boolean => {
	return (
		availability.status === DomainAvailabilityStatus.REGISTERED ||
		( availability.status === DomainAvailabilityStatus.MAPPED &&
			shouldReturnGenericMappedMessage( availability ) )
	);
};

export const SearchNotice = () => {
	const {
		query,
		queries,
		events,
		currentSiteUrl,
		config: { includeOwnedDomainInSuggestions, skippable, hideFreeSubdomainSuggestion },
	} = useDomainSearch();
	const { error: suggestionError } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability, error: availabilityError } = useQuery(
		queries.domainAvailability( query )
	);

	const { onSearchNoticeSkipClick } = events;
	const queryClient = useQueryClient();
	const isSkipping = useRef( false );

	const skipFromNotice = useMemo( () => {
		if ( ! onSearchNoticeSkipClick || ! skippable ) {
			return null;
		}

		return async ( status: DomainAvailabilityStatus ) => {
			if ( isSkipping.current ) {
				return;
			}

			isSkipping.current = true;
			onSearchNoticeSkipClick( query, status );

			try {
				if ( hideFreeSubdomainSuggestion || currentSiteUrl ) {
					events.onSkip();
					return;
				}

				// Exact-domain searches don't load the free subdomain, so it's fetched on demand.
				const freeSuggestion = await queryClient
					.fetchQuery(
						queries.freeSuggestion(
							isWpcomSubdomainQuery( query ) ? stripWpcomSubdomainSuffix( query ) : query
						)
					)
					.catch( () => undefined );

				events.onSkip( freeSuggestion );
			} finally {
				isSkipping.current = false;
			}
		};
	}, [
		onSearchNoticeSkipClick,
		skippable,
		hideFreeSubdomainSuggestion,
		currentSiteUrl,
		query,
		queries,
		queryClient,
		events,
	] );

	const notice = useMemo( () => {
		if (
			! availability ||
			shouldHideAvailabilityNotice( availability, includeOwnedDomainInSuggestions )
		) {
			return null;
		}

		if ( isSubdomainWithUnavailableRootDomain( availability, query ) ) {
			const rootDomain = getRootDomain( query );

			return {
				severity: 'error' as const,
				message: createInterpolateElement(
					sprintf(
						/* translators: %(rootDomain)s is the root domain (e.g. example.com), %(subdomain)s is the searched subdomain (e.g. cms.example.com) */
						__(
							'The root domain <strong>%(rootDomain)s</strong> is owned by another account, so only its owner can add <strong>%(subdomain)s</strong>.'
						),
						{ rootDomain, subdomain: query }
					),
					{ strong: <strong /> }
				),
			};
		}

		if ( skipFromNotice && isConnectedToOtherAccount( availability ) ) {
			return {
				severity: 'error' as const,
				message: createInterpolateElement(
					__(
						'This domain is already connected to a WordPress.com site. You can <button>skip the domain for now</button> and keep building.'
					),
					{
						button: <button onClick={ () => skipFromNotice( availability.status ) } />,
					}
				),
			};
		}

		if ( shouldReturnGenericMappedMessage( availability ) ) {
			return {
				severity: 'error' as const,
				message: __( 'This domain is already connected to a WordPress.com site.' ),
			};
		}

		return getAvailabilityNotice( query, availability, events, currentSiteUrl );
	}, [
		query,
		availability,
		events,
		currentSiteUrl,
		includeOwnedDomainInSuggestions,
		skipFromNotice,
	] );

	// A failed suggestions request still renders the exact-match card when the FQDN is
	// available, so its error would contradict the card.
	const isFqdnShown =
		!! availability && isFqdnShownAsSuggestion( availability, includeOwnedDomainInSuggestions );
	const errorMessage =
		( isFqdnShown ? undefined : suggestionError?.message ) ?? availabilityError?.message;

	if ( errorMessage ) {
		return <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>;
	}

	if ( ! notice ) {
		return null;
	}

	return <DomainSearchNotice status={ notice.severity }>{ notice.message }</DomainSearchNotice>;
};
