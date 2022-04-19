import { Gridicon } from '@automattic/components';
import page from 'page';
import { useState } from 'react';
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

const Categories = ( { selected }: { selected?: string } ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const categories = useCategories();

	const [ selecting, setSelecting ] = useState( false );
	const toggleSelecting = () => setSelecting( ! selecting );

	const onClick = ( category: Category ) => {
		dispatch(
			recordTracksEvent( 'calypso_plugins_category_select', {
				tag: category.slug || '',
			} )
		);

		setSelecting( false );

		let url;
		if ( category.slug !== 'discover' ) {
			url = `/plugins/${ category.slug }/${ domain || '' }`;
		} else {
			url = `/plugins/${ domain || '' }`;
		}

		page( url );
	};

	const current = categories[ selected || 'discover' ] || categories.discover;

	return (
		<div className="categories__discover">
			<button className="categories__header" onClick={ toggleSelecting }>
				{ current.name }
				&nbsp;
				{ ! selecting && <Gridicon icon="chevron-right" /> }
				{ selecting && <Gridicon icon="chevron-down" /> }
			</button>
			{ selecting && (
				<ul className="categories__select-list">
					{ Object.values( categories ).map( ( category, n ) => (
						<>
							{ category.slug === 'analytics' && (
								<li>
									<hr />
								</li>
							) }
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
						</>
					) ) }
				</ul>
			) }
		</div>
	);
};

export default Categories;
