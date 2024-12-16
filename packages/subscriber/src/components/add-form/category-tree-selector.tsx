import { CheckboxControl, SearchControl, Spinner } from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import './style.scss';

interface Category {
	id: number;
	name: string;
	parent?: number;
}

interface CategoryData {
	lowerName: string;
	children: Category[];
}

interface Props {
	selected: number[];
	onChange: ( categoryId: number, checked: boolean ) => void;
	categories: Category[];
	isLoading?: boolean;
}

export const CategoryTreeSelector: React.FC< Props > = ( {
	selected,
	onChange,
	categories,
	isLoading,
} ) => {
	const { __ } = useI18n();
	const [ searchTerm, setSearchTerm ] = useState( '' );

	const filteredCategories = useMemo( () => {
		if ( ! searchTerm ) {
			return categories;
		}
		const lowerSearchTerm = searchTerm.toLowerCase();

		const categoryData = categories.reduce( ( map, category ) => {
			map.set( category.id, {
				lowerName: category.name.toLowerCase(),
				children: categories.filter( ( child ) => child.parent === category.id ),
			} );
			return map;
		}, new Map< number, CategoryData >() );

		return categories.filter( ( category ) => {
			const data = categoryData.get( category.id )!;
			return (
				data.lowerName.includes( lowerSearchTerm ) ||
				data.children.some( ( child ) =>
					categoryData.get( child.id )!.lowerName.includes( lowerSearchTerm )
				)
			);
		} );
	}, [ categories, searchTerm ] );

	const handleChange = ( categoryId: number ) => ( checked: boolean ) => {
		onChange( categoryId, checked );
	};

	const renderCategories = ( parentId?: number ): JSX.Element[] => {
		return filteredCategories
			.filter( ( category ) => {
				if ( parentId === undefined ) {
					return ! category.parent || category.parent === 0;
				}
				return category.parent === parentId;
			} )
			.map( ( category ) => (
				<div key={ category.id } className="category-tree-selector__item">
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ category.name }
						checked={ selected.includes( category.id ) }
						onChange={ handleChange( category.id ) }
					/>
					<div className="category-tree-selector__children">
						{ renderCategories( category.id ) }
					</div>
				</div>
			) );
	};

	return (
		<div className="category-tree-selector">
			{ isLoading ? (
				<Spinner />
			) : (
				<>
					<SearchControl
						className="category-tree-selector__search"
						onChange={ setSearchTerm }
						value={ searchTerm }
						placeholder={ __( 'Search…' ) }
					/>
					<div className="category-tree-selector__list">
						{ filteredCategories.length > 0 ? (
							renderCategories()
						) : (
							<p>{ __( 'No results. Please try a different search.' ) }</p>
						) }
					</div>
				</>
			) }
		</div>
	);
};
