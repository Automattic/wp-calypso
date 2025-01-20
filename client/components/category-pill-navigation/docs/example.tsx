import { Card } from '@automattic/components';
import { Icon, starEmpty as iconStar, category as iconCategory } from '@wordpress/icons';
import { FunctionComponent } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';

const categories = Array.from( { length: 15 }, ( _, i ) => ( {
	id: `category-${ i }`,
	label: `Category ${ i }`,
	link: '#',
} ) );

const CategoryPillNavigationExample: FunctionComponent = () => {
	return (
		<div>
			<Card>
				<CategoryPillNavigation selectedCategoryId="category-2" categories={ categories } />
			</Card>

			<Card>
				<CategoryPillNavigation
					selectedCategoryId="category-2"
					buttons={ [
						{
							id: 'discover',
							icon: <Icon icon={ iconStar } size={ 30 } />,
							label: 'Discover',
							link: '/',
						},
						{
							id: 'all',
							icon: <Icon icon={ iconCategory } size={ 26 } />,
							label: 'All categories',
							link: '/',
						},
					] }
					categories={ categories }
				/>
			</Card>
		</div>
	);
};

export default CategoryPillNavigationExample;
