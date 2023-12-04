/**
 * Internal dependencies
 */
import RatingSummary from '../rating-summary';

export default {
	title: 'WooCommerce.com/components/Reviews/RatingSummary',
	component: RatingSummary,
};

const Template = ( args ) => <RatingSummary { ...args } />;

export const Story = Template.bind( {} );
Story.storyName = 'Rating Summary';

Story.args = {
	href: '#test',
	rating: 4.67,
	reviews: 21,
};
