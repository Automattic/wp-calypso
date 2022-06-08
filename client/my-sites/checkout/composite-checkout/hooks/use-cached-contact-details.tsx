import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type {
	FetchedContactDetails,
	PossiblyCompleteDomainContactDetails,
} from '@automattic/wpcom-checkout';
import type { ComponentType, FC } from 'react';

export function useCachedContactDetails() {
	return useQuery< PossiblyCompleteDomainContactDetails, Error >(
		'cached-contact-details',
		() =>
			wpcom.req
				.get( '/me/domain-contact-information' )
				.then( ( data: FetchedContactDetails ) =>
					mapRecordKeysRecursively( data, snakeToCamelCase )
				),
		{}
	);
}

export function withCachedContactDetails< ComponentProps >(
	Component: ComponentType<
		ComponentProps & { cachedContactDetails: PossiblyCompleteDomainContactDetails | null }
	>
): FC< ComponentProps > {
	return ( props ) => {
		const { data, isFetching } = useCachedContactDetails();
		const cachedContactDetails = isFetching ? null : data ?? null;
		return <Component { ...props } cachedContactDetails={ cachedContactDetails } />;
	};
}
