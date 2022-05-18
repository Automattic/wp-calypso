import { ResponsiveToolbarGroup } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import page from 'page';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useCategories } from './use-categories';
import './style.scss';

export type Category = {
	name: string;
	slug: string;
	tags: string[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

const ALLOWED_CATEGORIES = [
	'discover',
	'analytics',
	'booking',
	'customer',
	'design',
	'donations',
	'ecommerce',
	'education',
	'finance',
	'marketing',
	'seo',
	'photo',
	'social',
	'widgets',
	'email',
	'security',
	'shipping',
	'posts',
];

const Categories = ( { selected }: { selected?: string } ) => {
	const dispatch = useDispatch();
	const isSwippeable = useBreakpoint( '<660px' );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const categories = Object.values( useCategories( ALLOWED_CATEGORIES ) );

	const onClick = ( index: number ) => {
		const category = categories[ index ];

		dispatch(
			recordTracksEvent( 'calypso_plugins_category_select', {
				tag: category.slug || '',
			} )
		);

		let url;
		if ( category.slug !== 'discover' ) {
			url = `/plugins/${ category.slug }/${ domain || '' }`;
		} else {
			url = `/plugins/${ domain || '' }`;
		}

		page( url );
	};

	if ( selected && ! ALLOWED_CATEGORIES.includes( selected ) ) {
		return <div></div>;
	}

	const current = selected ? categories.findIndex( ( { slug } ) => slug === selected ) : 0;

	if ( isSwippeable ) {
		//return mobile view
		return <div></div>;
	}

	return (
		<ResponsiveToolbarGroup
			className="categories__menu"
			initialActiveIndex={ current }
			onClick={ onClick }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
};

export default Categories;
