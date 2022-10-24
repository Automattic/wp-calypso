import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import BlazePressWidget, { goToOriginalEndpoint } from 'calypso/components/blazepress-widget';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

const PageEllipsisMenuWrapper = ( { children, globalId } ) => {
	const keyValue = globalId;
	const { isModalOpen, value, closeModal } = useRouteModal( 'blazepress-widget', keyValue );
	const post = useSelector( ( state ) => getPost( state, globalId ) );
	const { queryClient } = useQueryClient();
	const previousRoute = useSelector( getPreviousRoute );

	return (
		<>
			{ post && (
				<BlazePressWidget
					isVisible={ isModalOpen && value === keyValue }
					siteId={ post.site_ID }
					postId={ post.ID }
					onClose={ () => {
						queryClient &&
							queryClient.invalidateQueries( [ 'promote-post-campaigns', post.site_ID ] );
						if ( previousRoute ) {
							closeModal();
						} else {
							goToOriginalEndpoint();
						}
					} }
				/>
			) }
			{ children }
		</>
	);
};

export default PageEllipsisMenuWrapper;
