var inflight = {};

// Utility methods to track inflight async requests
module.exports = {
	requestInflight: function( requestKey ) {
		return requestKey in inflight;
	},

	requestTracker: function( requestKey, callback ) {
		inflight[ requestKey ] = true;
		return function( error, data ) {
			delete inflight[ requestKey ];
			callback( error, data );
		};
	}
};
