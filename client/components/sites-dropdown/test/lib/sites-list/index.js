
const sites = {
	1: {
		ID: 1,
		slug: 'primary.wordpress.com'
	},
	42: {
		ID: 42,
		slug: 'foo.wordpress.com'
	}
};

class SiteList {
	getPrimary() {
		return sites[ '1' ];
	}

	getSite( siteId ) {
		if ( sites[ siteId ] ) {
			return sites[ siteId ];
		}

		for ( const k in sites ) {
			if ( sites.hasOwnProperty( k ) ) {
				if ( sites[ k ].slug === siteId ) {
					return sites[ k ];
				}
			}
		}

		return null;
	}
}

const siteList = new SiteList;

export default function factory() {
	return siteList;
}
