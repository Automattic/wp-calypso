var store = {},
	getCalled = 0,
	setCalled = 0;

module.exports = {
	reset: function() {
		store = {};
		getCalled = 0;
		setCalled = 0;
	},
	get: function( key ) {
		getCalled++;
		return store[ key ];
	},
	set: function( key, content ) {
		setCalled++;
		store[ key ] = content;
	},
	getActivity: function() {
		return {
			get: getCalled,
			set: setCalled
		};
	}
};