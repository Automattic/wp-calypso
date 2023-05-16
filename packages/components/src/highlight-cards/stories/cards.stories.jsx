import { action } from '@storybook/addon-actions';
import AnnualCards from '../annual-highlight-cards';
import WeeklyCards from '../weekly-highlight-cards';

export default { title: 'packages/components/Highlight Cards' };

const handleClick = action( 'click' );

const WeeklyVariations = ( props ) => (
	<WeeklyCards
		counts={ {
			comments: 45,
			likes: 0,
			views: 4673,
			visitors: 1548,
		} }
		previousCounts={ {
			comments: 45,
			likes: 100,
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

export const WeeklyHighlights = () => <WeeklyVariations />;

export const WeeklyHighlightsWithPartialPreviousCounts = () => (
	<WeeklyVariations
		previousCounts={ {
			comments: null,
			likes: null,
			views: 4073,
			visitors: 1412,
		} }
	/>
);
export const WeeklyHighlightsWithoutPreviousCounts = () => (
	<WeeklyVariations previousCounts={ null } />
);

export const WeeklyHighlightsWithoutCounts = () => (
	<WeeklyVariations counts={ null } previousCounts={ null } />
);

export const AnnualHighlights = () => (
	<AnnualCards
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
