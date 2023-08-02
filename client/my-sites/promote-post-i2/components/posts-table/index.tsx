import '../campaigns-table/style.scss';

import { BlazablePost } from 'calypso/data/promote-post/types';
import { Experiment } from 'calypso/lib/explat';
import PostItem from 'calypso/my-sites/promote-post-i2/components/post-item';
import PostItemExperiment from 'calypso/my-sites/promote-post-i2/components/post-item-experiment';
import { ItemsLoading, SingleItemLoading } from '../campaigns-table';
import PostsListHeader from '../posts-list/header';

interface Props {
	posts: BlazablePost[];
	isLoading: boolean;
	isFetchingPageResults: boolean;
}

export default function PostsTable( props: Props ) {
	const { posts, isLoading, isFetchingPageResults } = props;

	const DefaultItem = posts.map( ( post: BlazablePost ) => {
		return <PostItemExperiment key={ `post-id${ post.ID }` } post={ post } />;
	} );

	const ExperimentItem = posts.map( ( post: BlazablePost ) => {
		return <PostItem key={ `post-id${ post.ID }` } post={ post } />;
	} );

	return (
		<table className="promote-post-i2__table">
			<PostsListHeader />

			<tbody>
				{ isLoading && ! isFetchingPageResults ? (
					<ItemsLoading />
				) : (
					<>
						<Experiment
							name="experiment_name"
							defaultExperience={ DefaultItem }
							treatmentExperience={ ExperimentItem }
							loadingExperience={ <></> }
						/>
						{ isFetchingPageResults && <SingleItemLoading /> }
					</>
				) }
			</tbody>
		</table>
	);
}
