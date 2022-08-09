import { ResponsiveToolbarGroup } from '@automattic/components';
import page from 'page';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ALLOWED_REAL_CATEGORIES, useCategories } from './use-categories';
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
	const categories = Object.values( useCategories( ALLOWED_REAL_CATEGORIES ) );
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

	if ( selected && ! ALLOWED_REAL_CATEGORIES.includes( selected ) ) {
		return <div></div>;
	}

	const current = selected ? categories.findIndex( ( { slug } ) => slug === selected ) : 0;
	const isBrowser = typeof window !== 'undefined';

	return (
		<ResponsiveToolbarGroup
			className="categories__menu"
			initialActiveIndex={ current }
			onClick={ onClick }
			hrefList={ categoryUrls }
			forceMode={ isBrowser ? undefined : 'swipe' }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default Categories;
