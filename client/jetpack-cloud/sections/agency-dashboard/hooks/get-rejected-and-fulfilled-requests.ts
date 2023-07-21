export default function getRejectedAndFulfilledRequests(
	promises: any[],
	requests: { site: { blog_id: number; url: string } }[]
) {
	const allSelectedSites: {
		site: { blog_id: number; url: string };
		status: 'rejected' | 'fulfilled';
	}[] = [];

	promises.forEach( ( promise, index ) => {
		const { status } = promise;
		const site = requests[ index ].site;
		const item = {
			site,
			status,
		};
		allSelectedSites.push( item );
	} );

	const fulfilledRequests = allSelectedSites.filter(
		( product ) => product.status === 'fulfilled'
	);
	const rejectedRequests = allSelectedSites.filter( ( product ) => product.status === 'rejected' );

	return { fulfilledRequests, rejectedRequests };
}
