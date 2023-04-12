import { translate } from 'i18n-calypso';

type PostsListHeaderColumn = {
	id: string;
	title: string | null;
};

export default function PostsListHeader() {
	const columns: Array< PostsListHeaderColumn > = [
		{
			id: 'post',
			title: translate( 'Post' ),
		},
		{
			id: 'type',
			title: translate( 'Type' ),
		},
		{
			id: 'publish-date',
			title: translate( 'Publish date' ),
		},
		{
			id: 'visitors',
			title: translate( 'Visitors' ),
		},
		{
			id: 'likes',
			title: translate( 'Likes' ),
		},
		{
			id: 'comments',
			title: translate( 'Comments' ),
		},
		{
			id: 'view',
			title: null,
		},
		{
			id: 'promote',
			title: null,
		},
	];

	return (
		<div className="posts-list__header">
			{ columns.map( ( item ) => (
				<div className={ `posts-list__header-column posts-list__column-${ item.id }` }>
					{ item.title }
				</div>
			) ) }
		</div>
	);
}
