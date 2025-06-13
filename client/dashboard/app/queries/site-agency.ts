import { fetchAgencyBlog } from '../../data/agency';

export const siteAgencyBlogQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'agency-blog' ],
	queryFn: () => {
		return fetchAgencyBlog( siteId );
	},
	retry: ( failureCount: number, error: { code?: string } ) => {
		// Stop retrying if we already know the blog is not an agency blog.
		if ( error.hasOwnProperty( 'code' ) && error.code === 'partner_for_blog_not_found' ) {
			return false;
		}

		return failureCount < 3;
	},
} );
