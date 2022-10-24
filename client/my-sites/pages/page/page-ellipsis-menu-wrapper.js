import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';

const PageEllipsisMenuWrapper = ( { children, globalId } ) => {
	const keyValue = globalId;
	const { isModalOpen, value, closeModal } = useRouteModal( 'blazepress-widget', keyValue );
	const post = useSelector( ( state ) => getPost( state, globalId ) );
	const { queryClient } = useQueryClient();

	return (
		<>
			{ post && (
				<BlazePressWidget
					isVisible={ isModalOpen && value === keyValue }
					siteId={ post.site_ID }
					postId={ post.ID }
					onClose={ () => {
						queryClient.invalidateQueries( [ 'promote-post-campaigns', post.site_ID ] );
						closeModal();
					} }
				/>
			) }
			{ children }
		</>
	);
};

export default PageEllipsisMenuWrapper;
