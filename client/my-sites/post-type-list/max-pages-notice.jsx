import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './max-pages-notice.scss';

function PostTypeListMaxPagesNotice( { displayedPosts, totalPosts } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_post_type_list_max_pages_view' ) );
	}, [ dispatch ] );

	return (
		<div className="post-type-list__max-pages-notice">
			{ translate(
				'Showing %(displayedPosts)d post of %(totalPosts)d.',
				'Showing %(displayedPosts)d posts of %(totalPosts)d.',
				{
					count: displayedPosts,
					args: {
						displayedPosts,
						totalPosts,
					},
				}
			) }
			<br />
			{ translate( 'To view more posts, {{a}}switch to a specific site{{/a}}.', {
				components: {
					a: <a className="post-type-list__max-pages-notice-link" href="/sites" />,
				},
			} ) }
		</div>
	);
}

export default PostTypeListMaxPagesNotice;
