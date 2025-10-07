import nock from 'nock';
import type { DomainAvailability } from '@automattic/api-core';

export const mockGetAvailabilityQuery = ( {
	availability,
}: {
	availability: DomainAvailability;
} ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.3/domains/${ availability.domain_name }/is-available` )
		.reply( 200, availability );
};
