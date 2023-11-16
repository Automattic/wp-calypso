type SelectedSite = {
	blog_id: number;
	url: string;
};

type Request = {
	site: SelectedSite;
};

type Result = {
	site: SelectedSite;
	status: 'rejected' | 'fulfilled';
};

export default function getRejectedAndFulfilledRequests< T >(
	promises: PromiseSettledResult< T >[],
	requests: Request[]
) {
	const results: Result[] = promises.map( ( { status }, index ) => ( {
		site: requests[ index ].site,
		status,
	} ) );

	return {
		fulfilledRequests: results.filter( ( { status } ) => status === 'fulfilled' ),
		rejectedRequests: results.filter( ( { status } ) => status === 'rejected' ),
	};
}
