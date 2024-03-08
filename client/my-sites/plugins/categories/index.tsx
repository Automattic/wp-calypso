import page from '@automattic/calypso-router';
import { ResponsiveToolbarGroup } from '@automattic/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ALLOWED_CATEGORIES, useCategories } from './use-categories';
import { useGetCategoryUrl } from './use-get-category-url';

import './style.scss';

export type Category = {
	menu: string;
	title: string;
	slug: string;
	tags: string[];
	preview: Plugin[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

export type Plugin = {
	slug: string;
	name: string;
	short_description: string;
	icon: string;
};

const Categories = ( { selected, noSelection }: { selected?: string; noSelection?: boolean } ) => {
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
	const activeIndex = noSelection ? -1 : current;

	return (
		<ResponsiveToolbarGroup
			className="categories__menu"
			initialActiveIndex={ activeIndex }
			onClick={ onClick }
			hrefList={ categoryUrls }
			forceSwipe={ 'undefined' === typeof window }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` } title={ category.menu }>
					{ category.menu }
				</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default Categories;
