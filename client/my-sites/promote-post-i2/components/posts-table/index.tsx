import '../campaigns-table/style.scss';
import { useState, useEffect } from 'react';
import { BlazablePost } from 'calypso/data/promote-post/types';
import { useExperiment } from 'calypso/lib/explat';
import PostItem from 'calypso/my-sites/promote-post-i2/components/post-item';
import { ItemsLoading, SingleItemLoading } from '../campaigns-table';
import PostsListHeader from '../posts-list/header';

interface Props {
	posts: BlazablePost[];
	isLoading: boolean;
	isFetchingPageResults: boolean;
}

export default function PostsTable( props: Props ) {
	const { posts, isLoading, isFetchingPageResults } = props;

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'dsp_blaze_open_widget_button_202308'
	);

	const [ postClassName, setPostClassName ] = useState( '' );

	useEffect( () => {
		if ( ! isLoadingExperimentAssignment && undefined !== experimentAssignment?.variationName ) {
			const className =
				experimentAssignment?.variationName === 'treatment' ? 'post-item__row_experimental' : '';
			setPostClassName( className );
		}
	}, [ isLoadingExperimentAssignment, experimentAssignment ] );

	return (
		<table className="promote-post-i2__table">
			<PostsListHeader />

			<tbody>
				{ ( isLoading && ! isFetchingPageResults ) || isLoadingExperimentAssignment ? (
					<ItemsLoading />
				) : (
					<>
						{ posts.map( ( post: BlazablePost ) => {
							return (
								<PostItem key={ `post-id${ post.ID }` } post={ post } className={ postClassName } />
							);
						} ) }
						{ isFetchingPageResults && <SingleItemLoading /> }
					</>
				) }
			</tbody>
		</table>
	);
}
