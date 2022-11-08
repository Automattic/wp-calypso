import { action } from '@storybook/addon-actions';
import HighlightCards from '../';
import AnnualHighlightCards from '../annual-highlight-cards';

export default { title: 'Highlight Cards' };

const handleClick = action( 'click' );

const HighlightCardsVariations = ( props ) => (
	<HighlightCards
		counts={ {
			comments: 45,
			likes: 0,
			views: 4673,
			visitors: 1548,
		} }
		previousCounts={ {
			comments: 45,
			likes: 0,
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

export const AnnualHighlights = () => (
	<AnnualHighlightCards
		counts={ {
			comments: 72490,
			likes: 12298,
			posts: 79,
			words: 205035,
			followers: 1113323,
		} }
		year={ 2022 }
	/>
);
