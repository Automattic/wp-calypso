import { Card } from '@automattic/components';
import { Icon, starEmpty as iconStar, category as iconCategory } from '@wordpress/icons';
import { FunctionComponent } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';

const list = Array.from( { length: 15 }, ( _, i ) => ( {
	id: `category-${ i }`,
	label: `Category ${ i }`,
	link: '#',
} ) );

export const CategoryPillNavigationExample: FunctionComponent = () => {
	return (
		<div>
			<Card>
				<CategoryPillNavigation selectedCategory="category-2" list={ list } />
			</Card>

			<Card>
				<CategoryPillNavigation
					selectedCategory="category-2"
					buttons={ [
						{
							icon: <Icon icon={ iconStar } size={ 30 } />,
							label: 'Discover',
							link: '/',
						},
						{
							icon: <Icon icon={ iconCategory } size={ 26 } />,
							label: 'All categories',
							link: '/',
						},
					] }
					list={ list }
				/>
			</Card>
		</div>
	);
};
