import { Card } from '@automattic/components';
import { FunctionComponent } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import ImgStar from 'calypso/my-sites/patterns/pages/category/images/star.svg';

const list = Array.from( { length: 15 }, ( _, i ) => ( {
	name: `category-${ i }`,
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
							icon: ImgStar,
							label: 'Discover',
							link: '/',
						},
						{
							icon: ImgStar,
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
