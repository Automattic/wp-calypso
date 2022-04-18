import { Gridicon } from '@automattic/components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAllCategoriesRecords } from './categories-list';
import './style.scss';

export type Category = {
	name: string;
	slug: string;
	tags: string[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

const Categories = ( {
	onSelect,
	selectedSlug,
}: {
	onSelect: ( category: Category ) => void;
	selectedSlug?: string;
} ) => {
	const dispatch = useDispatch();

	const [ selecting, setSelecting ] = useState( false );
	const toggleSelecting = () => setSelecting( ! selecting );
	const [ selected, setSelected ] = useState< Category >(
		getAllCategoriesRecords()[ selectedSlug || 'discover' ]
	);

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
					{ Object.values( getAllCategoriesRecords() ).map( ( category, n ) => (
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
			{ /*{ selected.slug === 'discover' && (*/ }
			{ /*	<PopularCategories onSelect={ onClick } categories={ Object.values( popularCategories ) } />*/ }
			{ /*) }*/ }
		</div>
	);
};

export default Categories;
