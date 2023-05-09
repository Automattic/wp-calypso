import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';

const PageEllipsisMenuWrapper = ( { children, globalId } ) => {
	const keyValue = globalId;
	const { isModalOpen, value } = useRouteModal( 'blazepress-widget', keyValue );
	const post = useSelector( ( state ) => getPost( state, globalId ) );

	return (
		<>
			{ post && (
				<BlazePressWidget
					isVisible={ isModalOpen && value === keyValue }
					siteId={ post.site_ID }
					postId={ post.ID }
					keyValue={ globalId }
				/>
			) }
			{ children }
		</>
	);
};

export default PageEllipsisMenuWrapper;
