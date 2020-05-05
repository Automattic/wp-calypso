const endpoints = [ 'add', 'del' ];

/**
 * Stub wp module to avoid its dependency on the browser
 * Also stubbing undocumented endpoints and returning test data
 * TODO create error state stubs 500 / timeouts
 **/
const successRequestStub = function () {
	const args = Array.prototype.slice.call( arguments );
	args[ 1 ].apply( undefined, [ null, { some: 'data' } ] );
};

export default {
	site: function () {
		return {
			follow: function () {
				const siteEndpoints = {};
				endpoints.forEach( function ( endpoint ) {
					siteEndpoints[ endpoint ] = successRequestStub;
				}, this );
				return siteEndpoints;
			},
		};
	},
};
