import { translate } from 'i18n-calypso';

type PostsListHeaderColumn = {
	id: string;
	title: string | null;
};

type PostsListHeaderProps = {
	type: 'product' | 'post' | 'page';
};

export default function PostsListHeader( { type }: PostsListHeaderProps ) {
	const getHeaderColumns = (): Array< PostsListHeaderColumn > => {
		const columns: Array< PostsListHeaderColumn > = [
			{
				id: 'data',
				title: translate( 'Post' ),
			},
			{
				id: 'type',
				title: translate( 'Type' ),
			},
		];

		if ( type === 'product' ) {
			columns.push(
				{
					id: 'sku',
					title: translate( 'SKU' ),
				},
				{
					id: 'price',
					title: translate( 'Price' ),
				}
			);
		}

		columns.push( {
			id: 'publish-date',
			title: translate( 'Publish date' ),
		} );

		columns.push( {
			id: 'views',
			title: translate( 'Visitors' ),
		} );

		if ( type === 'post' || type === 'page' ) {
			columns.push(
				{
					id: 'likes',
					title: translate( 'Likes' ),
				},
				{
					id: 'comments',
					title: translate( 'Comments' ),
				}
			);
		}

		columns.push(
			{
				id: 'view',
				title: null,
			},
			{
				id: 'promote',
				title: null,
			}
		);

		return columns;
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
