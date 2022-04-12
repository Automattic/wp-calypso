import { Card, Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

export type Category = {
	slug: string;
	name: string;
	separator?: boolean;
};

const PopularCategories = ( {
	onSelect,
	categories,
}: {
	onSelect: ( category: Category ) => void;
	categories: Category[];
} ) => {
	return (
		<div className="categories__card-list">
			{ categories.slice( 0, 6 ).map(
				( category, n ) =>
					! category.separator && (
						<Card
							className="categories__card-list-item"
							onClick={ () => onSelect( category ) }
							onKeyPress={ () => onSelect( category ) }
							role="link"
							tabIndex={ 0 }
							key={ 'popular-categories-' + n }
						>
							{ category.name }
						</Card>
					)
			) }
		</div>
	);
};

const Categories = ( { onSelect }: { onSelect: ( category: Category ) => void } ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();

	const popularCategories: Category[] = [
		{ slug: 'discover', name: __( 'Discover' ) },
		{ slug: 'collections', name: __( 'Collections' ) },
		{ slug: '', name: '', separator: true },
		{ slug: 'all', name: __( 'All Categories' ) },
		{ slug: 'ecommerce', name: __( 'Ecommerce' ) },
		{ slug: 'widget', name: __( 'Widgets' ) },
		{ slug: 'posts', name: __( 'Posts & Pages' ) },
		{ slug: 'admin', name: __( 'Administration' ) },
		{ slug: 'shortcode', name: __( 'Shortcodes' ) },
		{ slug: 'comments', name: __( 'Comments' ) },
		{ slug: 'seo', name: __( 'SEO' ) },
		{ slug: 'images', name: __( 'Images' ) },
		{ slug: 'social', name: __( 'Social' ) },
		{ slug: 'sidebar', name: __( 'Sidebar' ) },
		{ slug: 'email', name: __( 'Email' ) },
		{ slug: 'security', name: __( 'Security' ) },
		{ slug: 'video', name: __( 'Video' ) },
		{ slug: 'links', name: __( 'Links' ) },
	];

	const onClick = () => {
		const category = { slug: 'todo', name: 'ToDo' };

		dispatch(
			recordTracksEvent( 'calypso_plugins_discover_click', {
				category: category.slug,
			} )
		);

		onSelect( category );
	};

	const [ selecting, setSelecting ] = useState( false );
	const toggleSelecting = () => setSelecting( ! selecting );

	return (
		<div className="categories__discover">
			<button className="categories__header" onClick={ toggleSelecting }>
				{ /* translators: Page title, referring to discovering categories */ }
				{ __( 'Discover' ) }
				&nbsp;
				{ ! selecting && <Gridicon icon="chevron-right" /> }
				{ selecting && <Gridicon icon="chevron-down" /> }
			</button>
			{ selecting && (
				<ul className="categories__select-list">
					{ popularCategories.map( ( category, n ) => (
						<li key={ 'categories-' + n }>
							{ category.separator && <hr /> }
							{ ! category.separator && (
								<span
									onClick={ () => onSelect( category ) }
									onKeyPress={ () => onSelect( category ) }
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
			<PopularCategories onSelect={ onClick } categories={ popularCategories } />
		</div>
	);
};

export default Categories;
