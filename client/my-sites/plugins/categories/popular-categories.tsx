import { Card, Gridicon } from '@automattic/components';
import type { Category } from '../categories';
import './style.scss';

const PopularCategories = ( {
	onSelect,
	categories,
}: {
	onSelect: ( category: Category ) => void;
	categories: Category[];
} ) => {
	return (
		<div className="categories__card-list">
			{ categories.slice( 6, 12 ).map(
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
							{ category?.icon && <Gridicon icon={ category?.icon } /> }
							<div>
								<p>{ category.name }</p>
								{ category?.description?.length && <p>{ category?.description }</p> }
							</div>
						</Card>
					)
			) }
		</div>
	);
};

export default PopularCategories;
