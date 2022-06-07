import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type {
	FetchedContactDetails,
	PossiblyCompleteDomainContactDetails,
} from '@automattic/wpcom-checkout';

export function useCachedContactDetails(): PossiblyCompleteDomainContactDetails | null {
	const { data: cachedContactDetails, isFetching } = useQuery<
		PossiblyCompleteDomainContactDetails,
		Error
	>(
		'cached-contact-details',
		() =>
			wpcom.req
				.get( '/me/domain-contact-information' )
				.then( ( data: FetchedContactDetails ) =>
					mapRecordKeysRecursively( data, snakeToCamelCase )
				),
		{ refetchOnMount: 'always' }
	);
	return isFetching ? null : cachedContactDetails ?? null;
}
