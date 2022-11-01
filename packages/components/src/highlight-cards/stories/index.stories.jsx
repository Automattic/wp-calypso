import { action } from '@storybook/addon-actions';
import HighlightCards from '../';

export default { title: 'Highlight Cards' };

const handleClick = action( 'click' );

const HighlightCardsVariations = ( props ) => (
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
		{ ...props }
	/>
);

export const Default = () => <HighlightCardsVariations />;

export const WithPartialPreviousCounts = () => (
	<HighlightCardsVariations
		previousCounts={ {
			comments: null,
			likes: null,
			views: 4073,
			visitors: 1412,
		} }
	/>
);
export const WithoutPreviousCounts = () => <HighlightCardsVariations previousCounts={ null } />;

export const WithoutCounts = () => (
	<HighlightCardsVariations counts={ null } previousCounts={ null } />
);
