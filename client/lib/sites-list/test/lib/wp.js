/**
 * Stub wp module to avoid its dependency on the browser
 **/
module.exports = {
	undocumented: function() {
		return {
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
