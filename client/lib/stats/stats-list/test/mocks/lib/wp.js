var successEndpoints,
	documentedSuccessEndpoints,
	failureEndpoints;

successEndpoints = [
	'statsVideoPlays',
	'statsTags'
];

documentedSuccessEndpoints = [
	'statsVisits',
	'statsReferrers',
	'statsTopPosts',
	'statsClicks',
	'statsCountryViews',
	'statsSearchTerms'
];


failureEndpoints = [
	'statsPostViews',
	'statsEvents',
	'statsTopAuthors'
];



/**
 * Stub wp module to avoid its dependency on the browser
 * Also stubbing undocumented endpoints and returning test data
 * TODO create error state stubs 500 / timeouts
 **/

var successRequestStub = function(){
	var args = Array.prototype.slice.call( arguments );

	args[ 1 ].apply( undefined, [ null, { some: 'data' } ] );
};

var failureRequestStub = function(){
	var args = Array.prototype.slice.call( arguments );

	args[ 1 ].apply( undefined, [ { 'error': 'some code', 'message': 'some message' }, null ] );
};

module.exports = {
	site: function() {
		var siteEndpoints = {};
		documentedSuccessEndpoints.forEach( function( endpoint ){
			siteEndpoints[ endpoint ] = successRequestStub;
		}, this );
		failureEndpoints.forEach( function( endpoint ){
					siteEndpoints[ endpoint ] = failureRequestStub;
				}, this );
		
		return siteEndpoints;
	},
	undocumented: function() {
		return {
			site: function() {
				var siteEndpoints = {};
				successEndpoints.forEach( function( endpoint ){
					siteEndpoints[ endpoint ] = successRequestStub;
				}, this );
				failureEndpoints.forEach( function( endpoint ){
					siteEndpoints[ endpoint ] = failureRequestStub;
				}, this );
				return siteEndpoints;
			},
			me: function() {
				return {
					settings: function() {
						return {
							get: () => {}
						};
					}
				};
			}
		};
	}
};
