import { action } from '@storybook/addon-actions';
import HighlightCards from '../';

export default { title: 'Highlight Cards' };

const handleClick = action( 'click' );

export const Default = () => (
	<HighlightCards
		counts={ {
			comments: 45,
			likes: 103,
			views: 4673,
			visitors: 1548,
		} }
		previousCounts={ {
			comments: 50,
			likes: 123,
			views: 4073,
			visitors: 1412,
		} }
		onClickComments={ handleClick }
		onClickLikes={ handleClick }
		onClickViews={ handleClick }
		onClickVisitors={ handleClick }
	/>
);
