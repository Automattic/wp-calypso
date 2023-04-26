import { translate } from 'i18n-calypso';

type PostsListHeaderColumn = {
	id: string;
	title: string | null;
};

export default function PostsListHeader() {
	const columns: Array< PostsListHeaderColumn > = [
		{
			id: 'data',
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
			id: 'views',
			title: translate( 'Views' ),
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
		<thead className="posts-list__header">
			<tr>
				{ columns.map( ( item ) => (
					<th
						key={ item.id }
						className={ `posts-list__header-column post-item__post-${ item.id }` }
					>
						{ item.title }
					</th>
				) ) }
			</tr>
		</thead>
	);
}
