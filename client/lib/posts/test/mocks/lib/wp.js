export default {
	me: () => ( {
		get: () => {}
	} ),
	site: () => ( {
		post: () => ( {
			add: ( query, attributes, callback ) => {
				callback( null, attributes );
			}
		} )
	} )
};
