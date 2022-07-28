import { ResponsiveToolbarGroup } from '@automattic/components';
import page from 'page';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ALLOWED_CATEGORIES, useCategories } from './use-categories';

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

	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	// We hide these special categories from the category selector
	const displayCategories = ALLOWED_CATEGORIES.filter(
		( v ) => [ 'paid', 'popular', 'featured' ].indexOf( v ) < 0
	);

	const categories = Object.values( useCategories( displayCategories ) );
	const onClick = ( index: number ) => {
		const category = categories[ index ];

		dispatch(
			recordTracksEvent( 'calypso_plugins_category_select', {
				tag: category.slug || '',
			} )
		);

		let url;
		if ( category.slug !== 'discover' ) {
			url = `/plugins/browse/${ category.slug }/${ domain || '' }`;
		} else {
			url = `/plugins/${ domain || '' }`;
		}

		page( url );
	};

	if ( selected && ! displayCategories.includes( selected ) ) {
		return <div></div>;
	}

	const current = selected ? categories.findIndex( ( { slug } ) => slug === selected ) : 0;

	return (
		<ResponsiveToolbarGroup
			className="categories__menu"
			initialActiveIndex={ current }
			onClick={ onClick }
			forceSwipe={ 'undefined' === typeof window ? true : false }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default Categories;
