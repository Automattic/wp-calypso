import nock from 'nock';

export const mockGetAvailableTldsQuery = ( {
	params: { query },
	tlds,
}: {
	params: { query: string };
	tlds: string[];
} ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions/tlds' )
		.query( {
			search: query,
		} )
		.reply( 200, tlds );
};
