import { ResponsiveToolbarGroup } from '@automattic/components';
import page from 'page';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ALLOWED_CATEGORIES, useCategories } from './use-categories';
import { useGetCategoryUrl } from './use-get-category-url';

export type Category = {
	name: string;
	slug: string;
	tags: string[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

const Categories = ( { selected }: { selected?: string } ) => {
	const dispatch = useDispatch();
	const getCategoryUrl = useGetCategoryUrl();

	// We hide these special categories from the category selector
	const displayCategories = ALLOWED_CATEGORIES.filter(
		( v ) => [ 'paid', 'popular', 'featured' ].indexOf( v ) < 0
	);

	const categories = Object.values( useCategories( displayCategories ) );
	const categoryUrls = categories.map( ( { slug } ) => getCategoryUrl( slug ) );
	const onClick = ( index: number ) => {
		const category = categories[ index ];

		dispatch(
			recordTracksEvent( 'calypso_plugins_category_select', {
				tag: category.slug || '',
			} )
		);

		page( getCategoryUrl( category.slug ) );
	};

	const current = selected ? categories.findIndex( ( { slug } ) => slug === selected ) : 0;

	return (
		<ResponsiveToolbarGroup
			className="categories__menu"
			initialActiveIndex={ current }
			onClick={ onClick }
			hrefList={ categoryUrls }
			forceSwipe={ 'undefined' === typeof window }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default Categories;
