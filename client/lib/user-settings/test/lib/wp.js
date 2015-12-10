module.exports = {
	undocumented: function() {
		return {
			me: function() {
				return {
					settings: function() {
						return {
							get: function( callback ) {
								callback( false, {
									test: false,
									lang_id: false
								} );
							},
							update: function( settings, callback ) {
								setTimeout( function() {
									callback( null, settings );
								} );
							}
						};
					}
				};
			}
		};
	}
};
