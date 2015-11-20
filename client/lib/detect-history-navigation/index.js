var _loadedViaHistory = false;

module.exports = {
	start: function() {
		window.addEventListener( 'popstate', function() {
			_loadedViaHistory = true;
		} );
		setTimeout( function() {
			window.addEventListener( 'popstate', function() {
				_loadedViaHistory = false;
			} );
		} );
	},
	loadedViaHistory: function() {
		return _loadedViaHistory;
	}
};
