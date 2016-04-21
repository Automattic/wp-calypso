const me = function() {
	return {
		get() {},
		settings() {
			return {
				get( callback ) {
					callback( false, {
						test: false,
						lang_id: false
					} );
				},
				update( settings, callback ) {
					setTimeout( () => callback( null, settings ) );
				}
			};
		}
	};
}

export default {
	me,
	undocumented() {
		return { me };
	}
};
