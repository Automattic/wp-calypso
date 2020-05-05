let _loadedViaHistory = false;

export default {
	start: function () {
		// add a popstate listener that sets the flag
		window.addEventListener( 'popstate', function ( event ) {
			_loadedViaHistory = !! event.state;
		} );
	},
	loadedViaHistory: function () {
		return _loadedViaHistory;
	},
};
