import { useQuery } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

type UseNewsletterCategoriesBlogStickerProps = {
	siteId?: number | null;
};

const useNewsletterCategoriesBlogSticker = ( {
	siteId,
}: UseNewsletterCategoriesBlogStickerProps ): boolean => {
	const { data } = useQuery< string[] >( {
		queryKey: [ 'blog-stickers', siteId ],
		queryFn: () => request( { path: `/sites/${ siteId }/blog-stickers` } ),
		enabled: !! siteId,
	} );

	return data ? data.includes( 'newsletter-categories' ) : false;
};

export default useNewsletterCategoriesBlogSticker;
