import { useQuery } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

type useNewsletterCategoriesFeatureEnabledProps = {
	siteId?: string | number;
};

const useNewsletterCategoriesFeatureEnabled = ( {
	siteId,
}: useNewsletterCategoriesFeatureEnabledProps ): boolean => {
	const { data } = useQuery< string[] >( {
		queryKey: [ 'blog-stickers', siteId ],
		queryFn: () => request( { path: `/sites/${ siteId }/blog-stickers` } ),
		enabled: !! siteId,
	} );

	return data ? data.includes( 'newsletter-categories' ) : false;
};

export default useNewsletterCategoriesFeatureEnabled;
