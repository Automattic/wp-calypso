import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PopularCategories from './popular-categories';
import './style.scss';

export type Category = {
	name: string;
	slug: string;
	tags: string[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

const Categories = ( { onSelect }: { onSelect: ( category: Category ) => void } ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();

	const popularCategories: Record< string, Category > = {
		discover: { name: __( 'Discover' ), slug: 'discover', tags: [] },
		'top-free': { name: __( 'Top free plugins' ), slug: 'top-free', tags: [] },
		'top-paid': { name: __( 'Top premium plugins' ), slug: 'top-paid', tags: [] },
		editors: { name: __( 'Editor’s pick' ), slug: 'editors', tags: [] },
		separator: { name: '', separator: true, slug: '', tags: [] },
		all: { name: __( 'All Categories' ), slug: 'all', tags: [] },
		analytics: {
			name: __( 'Analytics' ),
			description: __( 'Analytics' ),
			icon: 'grid',
			slug: 'analytics',
			tags: [ 'analytics' ],
		},
		business: {
			name: __( 'Business' ),
			description: __( 'Business' ),
			icon: 'grid',
			slug: 'business',
			tags: [ 'business' ],
		},
		customer: {
			name: __( 'Customer Service' ),
			description: __( 'Customer Service' ),
			icon: 'grid',
			slug: 'customer',
			tags: [ 'customer-service' ],
		},
		design: {
			name: __( 'Design' ),
			description: __( 'Design' ),
			icon: 'grid',
			slug: 'design',
			tags: [ 'design' ],
		},
		ecommerce: {
			name: __( 'Ecommerce' ),
			description: __( 'Ecommerce' ),
			icon: 'grid',
			slug: 'ecommerce',
			tags: [ 'ecommerce', 'woocommerce' ],
		},
		education: {
			name: __( 'Education' ),
			description: __( 'Education' ),
			icon: 'grid',
			slug: 'education',
			tags: [ 'education' ],
		},
		finance: {
			name: __( 'Finance' ),
			description: __( 'Finance' ),
			icon: 'grid',
			slug: 'finance',
			tags: [ 'finance' ],
		},
		marketing: {
			name: __( 'Marketing' ),
			description: __( 'Marketing' ),
			icon: 'grid',
			slug: 'marketing',
			tags: [ 'marketing' ],
		},
		seo: {
			name: __( 'Search Optimization' ),
			description: __( 'Search Optimization' ),
			icon: 'grid',
			slug: 'seo',
			tags: [ 'seo' ],
		},
		photo: {
			name: __( 'Photo & Video' ),
			description: __( 'Photo & Video' ),
			icon: 'grid',
			slug: 'photo',
			tags: [ 'photo', 'video', 'media' ],
		},
		social: {
			name: __( 'Social' ),
			description: __( 'Social' ),
			icon: 'grid',
			slug: 'social',
			tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
		},
		widgets: {
			name: __( 'Widgets' ),
			description: __( 'Widgets' ),
			icon: 'grid',
			slug: 'widgets',
			tags: [ 'widgets' ],
		},
		email: {
			name: __( 'Email' ),
			description: __( 'Email' ),
			icon: 'grid',
			slug: 'email',
			tags: [ 'email' ],
		},
		security: {
			name: __( 'Security' ),
			description: __( 'Security' ),
			icon: 'grid',
			slug: 'security',
			tags: [ 'security' ],
		},
		posts: {
			name: __( 'Posts & Posting' ),
			description: __( 'Posts & Posting' ),
			icon: 'grid',
			slug: 'posts',
			tags: [ 'posts', 'post', 'page', 'pages' ],
		},
	};

	const [ selecting, setSelecting ] = useState( false );
	const toggleSelecting = () => setSelecting( ! selecting );
	const [ selected, setSelected ] = useState< Category >( popularCategories.discover );

	const onClick = ( category: Category ) => {
		dispatch(
			recordTracksEvent( 'calypso_plugins_discover_click', {
				tag: category.slug || '',
			} )
		);

		setSelected( category );
		setSelecting( false );

		onSelect( category );
	};

	return (
		<div className="categories__discover">
			<button className="categories__header" onClick={ toggleSelecting }>
				{ /* translators: Page title, referring to discovering categories */ }
				{ selected.name }
				&nbsp;
				{ ! selecting && <Gridicon icon="chevron-right" /> }
				{ selecting && <Gridicon icon="chevron-down" /> }
			</button>
			{ selecting && (
				<ul className="categories__select-list">
					{ Object.values( popularCategories ).map( ( category, n ) => (
						<li key={ 'categories-' + n }>
							{ category.separator && <hr /> }
							{ ! category.separator && (
								<span
									onClick={ () => onClick( category ) }
									onKeyPress={ () => onClick( category ) }
									role="link"
									tabIndex={ 0 }
								>
									{ category.name }
								</span>
							) }
						</li>
					) ) }
				</ul>
			) }
			{ selected.slug === 'discover' && (
				<PopularCategories onSelect={ onClick } categories={ Object.values( popularCategories ) } />
			) }
		</div>
	);
};

export default Categories;
