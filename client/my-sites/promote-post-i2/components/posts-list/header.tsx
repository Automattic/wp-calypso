import { translate } from 'i18n-calypso';

type PostsListHeaderColumn = {
	id: string;
	title: string | null;
};

type PostsListHeaderProps = {
	postType: 'product' | 'post' | 'page';
};

export default function PostsListHeader( { postType: postType }: PostsListHeaderProps ) {
	const postColumns: Array< PostsListHeaderColumn > = [
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

	const productColumns: Array< PostsListHeaderColumn > = [
		{
			id: 'data',
			title: translate( 'Post' ),
		},
		{
			id: 'type',
			title: translate( 'Type' ),
		},
		{
			id: 'sku',
			title: translate( 'SKU' ),
		},
		{
			id: 'price',
			title: translate( 'Price' ),
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
			id: 'view',
			title: null,
		},
		{
			id: 'promote',
			title: null,
		},
	];

	const getHeaderColumns = (): Array< PostsListHeaderColumn > => {
		switch ( postType ) {
			case 'product':
				return productColumns;
			case 'post':
			case 'page':
			default:
				return postColumns;
		}
	};

	return (
		<thead className="posts-list__header">
			<tr>
				{ getHeaderColumns().map( ( item ) => (
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
