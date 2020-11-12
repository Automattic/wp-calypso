import apiFetch from '@wordpress/api-fetch';

function registerApiHandlers( options ) {
	const preload = {
		OPTIONS: {
			// Reusable blocks
			'/wp/v2/blocks': {
				body: [],
			},
		},
	};

	apiFetch.use( apiFetch.createPreloadingMiddleware( preload ) );
}

export default registerApiHandlers;
