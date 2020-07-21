const evaluations = [
	require( './evaluations/node-memory' ),
	require( './evaluations/node-npm-cache' ),
	require( './evaluations/node-puppeteer' ),
	require( './evaluations/node-chromedriver' ),
	require( './evaluations/docker-cpu' ),
	require( './evaluations/docker-memory' ),
];

const runEvaluations = async () => {
	evaluations.sort(
		( a, b ) => a.group.localeCompare( b.group ) || a.title.localeCompare( b.title )
	);

	const results = Promise.all(
		evaluations.map( async ( { title, group, test, fix } ) => {
			const { result, message } = await test();

			let fixMessage;
			if ( ! result ) {
				fixMessage = await fix();
			}

			return {
				result,
				title,
				group,
				message,
				fixMessage,
			};
		} )
	);
	return results;
};

module.exports = {
	runEvaluations,
};
