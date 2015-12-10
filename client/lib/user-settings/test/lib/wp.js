module.exports = {
	undocumented: function() {
		return {
			me: function() {
				return {
					settings: function( callback ) {
						callback( false, {
							test: false,
							lang_id: false
						} );
					},
					saveSettings: function( settings, callback ) {
						setTimeout( function() {
							callback( null, settings );
						} );
					}
				};
			}
		};
	}
};
