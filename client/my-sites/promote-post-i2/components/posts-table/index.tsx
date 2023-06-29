import '../campaigns-table/style.scss';

import PostItem, { BlazablePost } from 'calypso/my-sites/promote-post-i2/components/post-item';
import { CampaignItemLoading } from '../campaigns-table';
import PostsListHeader from '../posts-list/header';

interface Props {
	posts: any;
	isLoading: boolean;
	isFetchingPageResults: boolean;
}

export default function PostsTable( props: Props ) {
	const { posts, isLoading, isFetchingPageResults } = props;

	return (
		<table className="promote-post-i2__table">
			<PostsListHeader />

			<tbody>
				{ isLoading && ! isFetchingPageResults ? (
					<>
						<CampaignItemLoading totalRows={ 8 } />
						<CampaignItemLoading totalRows={ 8 } />
						<CampaignItemLoading totalRows={ 8 } />
						<CampaignItemLoading totalRows={ 8 } />
						<CampaignItemLoading totalRows={ 8 } />
					</>
				) : (
					<>
						{ posts.map( ( post: BlazablePost ) => {
							return <PostItem key={ `post-id${ post.ID }` } post={ post } />;
						} ) }
						{ isFetchingPageResults && <CampaignItemLoading /> }
					</>
				) }
			</tbody>
		</table>
	);
}
