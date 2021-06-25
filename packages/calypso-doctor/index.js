/* eslint-disable jest/valid-title */

const evaluations = [
	require( './evaluations/node-memory' ),
	require( './evaluations/node-npm-cache' ),
	require( './evaluations/node-puppeteer' ),
	require( './evaluations/node-chromedriver' ),
	require( './evaluations/node-playwright' ),
	require( './evaluations/docker-cpu' ),
	require( './evaluations/docker-memory' ),
];

const runEvaluations = async () => {
	evaluations.sort(
		( a, b ) => a.group.localeCompare( b.group ) || a.title.localeCompare( b.title )
	);

	const results = Promise.all(
		evaluations.map( async ( { title, group, test, fix } ) => {
			const response = {
				title,
				group,
			};

			try {
				const { result, ignored, evaluationMessage = '' } = await new Promise(
					// eslint-disable-next-line no-async-promise-executor
					async ( resolve, reject ) => {
						try {
							const testResult = await test( {
								pass: () => resolve( { result: true } ),
								fail: ( message ) => resolve( { result: false, evaluationMessage: message } ),
								ignore: ( message ) => resolve( { ignored: true, evaluationMessage: message } ),
							} );
							// `test` is expected to call either pass or fail, which will resolve the promise. If
							// we reach this point, it has returned without calling them and that's an error.
							reject(
								new Error(
									`Evaluation '${ group } > ${ title }' returned an unexpected result: ${ testResult }`
								)
							);
						} catch ( err ) {
							reject( err );
						}
					}
				);

				response.result = result;
				response.ignored = ignored;
				response.evaluationMessage = evaluationMessage;
			} catch ( err ) {
				response.result = false;
				response.evaluationMessage = `ERROR running this evaluation: \n${ err.stack }`;
				return response;
			}

			try {
				if ( ! response.result && ! response.ignored ) {
					response.fixMessage = await fix();
				}
			} catch ( err ) {
				response.fixMessage = `ERROR trying to fix evaluation '${ group } > ${ title }': ${ err.stack }`;
			}

			return response;
		} )
	);

	return results;
};

module.exports = {
	runEvaluations,
};
