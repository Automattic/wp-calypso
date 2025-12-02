import nock from 'nock';
import type { DomainAvailability } from '@automattic/api-core';

export const mockGetAvailabilityQuery = ( {
	params: { domainName },
	availability,
}: {
	params: { domainName: string };
	availability: DomainAvailability | Error;
} ) => {
	const request = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.3/domains/${ domainName }/is-available` )
		.query( true );

	if ( availability instanceof Error ) {
		return request.replyWithError( availability );
	}

	return request.reply( 200, availability );
};
