import { QueryControls } from '@wordpress/components';
import { withState } from '@wordpress/compose';

interface StateProps {
	category: number;
	order: 'asc' | 'desc';
	orderBy: 'date' | 'title';
	numberOfItems: number;
}

const QueryControlsExample = withState( {
	orderBy: 'title',
	order: 'asc',
	category: 1,
	categories: [
		{
			id: 1,
			name: 'Category 1',
			parent: 0,
		},
		{
			id: 2,
			name: 'Category 1b',
			parent: 1,
		},
		{
			id: 3,
			name: 'Category 2',
			parent: 0,
		},
	],
	numberOfItems: 10,
} )(
	( {
		orderBy,
		order,
		category,
		categories,
		numberOfItems,
		setState,
	}: StateProps & {
		categories: { id: number; name: string; parent: number }[];
		setState: ( { category, order, orderBy }: Partial< StateProps > ) => void;
	} ) => (
		<QueryControls
			{ ...{ orderBy, order, numberOfItems } }
			onOrderByChange={ ( nextOrderBy ) => setState( { orderBy: nextOrderBy } ) }
			onOrderChange={ ( nextOrder ) => setState( { order: nextOrder } ) }
			categoriesList={ categories }
			selectedCategoryId={ category }
			onCategoryChange={ ( nextCategory: string ) =>
				setState( { category: Number( nextCategory ) } )
			}
			onNumberOfItemsChange={ ( nextNumberOfItems ) =>
				setState( { numberOfItems: nextNumberOfItems } )
			}
		/>
	)
);

export default QueryControlsExample;
