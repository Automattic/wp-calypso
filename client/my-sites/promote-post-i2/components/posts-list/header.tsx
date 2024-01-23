import { translate } from 'i18n-calypso';

type PostsListHeaderColumn = {
	id: string;
	title: string | null;
};

type PostsListHeaderProps = {
	postType: 'product' | 'post' | 'page';
};

export default function PostsListHeader( { postType: postType }: PostsListHeaderProps ) {
	const getHeaderColumns = (): Array< PostsListHeaderColumn > => {
		const columns = [
			{
				id: 'data',
				title: translate( 'Post' ),
			},
			{
				id: 'type',
				title: translate( 'Type' ),
			},
		];

		if ( postType === 'product' ) {
			columns.push( {
				id: 'sku',
				title: translate( 'SKU' ),
			} );
			columns.push( {
				id: 'price',
				title: translate( 'Price' ),
			} );
		}

		columns.push( {
			id: 'publish-date',
			title: translate( 'Publish date' ),
		} );

		if ( postType === 'post' || postType === 'page' ) {
			columns.push( {
				id: 'likes',
				title: translate( 'Likes' ),
			} );
			columns.push( {
				id: 'comments',
				title: translate( 'Comments' ),
			} );
		}

		columns.push( {
			id: 'visitors',
			title: translate( 'Visitors' ),
		} );

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
