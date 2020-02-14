/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import userFactory from 'lib/user';

export default function() {
	page( '/', context => {
		const user = userFactory();
		const { primarySiteSlug } = user.get();
		let redirectPath =
			primarySiteSlug && 'variant' === abtest( 'redirectToCustomerHome' )
				? `/home/${ primarySiteSlug }`
				: '/read';

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
