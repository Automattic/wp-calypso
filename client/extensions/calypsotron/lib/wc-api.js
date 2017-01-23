
export default class WCApi {
	constructor( wpcom ) {
		this.wpcom = wpcom;
	}

	fetchProductCategories( siteId, fn ) {
		return this.wpcom.req.get(
			{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
			{ path: '/wc/v1/products/categories' },
			fn
		);
	}
}

