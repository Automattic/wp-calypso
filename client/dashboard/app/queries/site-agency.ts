import { queryOptions } from '@tanstack/react-query';
import { fetchAgencyBlog } from '../../data/agency';
import { isWpError } from '../../data/error';

export const siteAgencyBlogQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'agency-blog' ],
		queryFn: () => fetchAgencyBlog( siteId ),
		retry: ( failureCount, error ) => {
			// Stop retrying if we already know the blog is not an agency blog.
			if ( isWpError( error ) && error.code === 'partner_for_blog_not_found' ) {
				return false;
			}

			return failureCount < 3;
		},
	} );
