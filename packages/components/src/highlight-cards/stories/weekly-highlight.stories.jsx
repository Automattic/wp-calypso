import { action } from '@storybook/addon-actions';
import WeeklyCards from '../weekly-highlight-cards';

export default {
	title: 'packages/components/Highlight Cards/WeeklyHighlightCards',
	component: WeeklyCards,
	argTypes: {
		'counts.comments': { control: 'number' },
		'counts.likes': { control: 'number' },
		'counts.views': { control: 'number' },
		'counts.visitors': { control: 'number' },
		'previousCounts.comments': { control: 'number' },
		'previousCounts.likes': { control: 'number' },
		'previousCounts.views': { control: 'number' },
		'previousCounts.visitors': { control: 'number' },
		'story.isLoading': { control: 'boolean' },
		showValueTooltip: { control: 'boolean' },
	},
};

const handleClick = action( 'click' );

const Template = ( { showValueTooltip, ...args } ) => {
	const counts = args[ 'story.isLoading' ]
		? {}
		: {
				comments: args[ 'counts.comments' ],
				likes: args[ 'counts.likes' ],
				views: args[ 'counts.views' ],
				visitors: args[ 'counts.visitors' ],
		  };

	const previousCounts = args[ 'story.isLoading' ]
		? {}
		: {
				comments: args[ 'previousCounts.comments' ],
				likes: args[ 'previousCounts.likes' ],
				views: args[ 'previousCounts.views' ],
				visitors: args[ 'previousCounts.visitors' ],
		  };

	return (
		<div
			style={ { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
		>
			<WeeklyCards
				counts={ counts }
				previousCounts={ previousCounts }
				onClickComments={ handleClick }
				onClickLikes={ handleClick }
				onClickViews={ handleClick }
				onClickVisitors={ handleClick }
				showValueTooltip={ showValueTooltip }
			/>
		</div>
	);
};

export const WeeklyHighlightCards = Template.bind( {} );
WeeklyHighlightCards.args = {
	'counts.comments': 45,
	'counts.likes': 0,
	'counts.views': 4673,
	'counts.visitors': 1548,
	'previousCounts.comments': 45,
	'previousCounts.likes': 100,
	'previousCounts.views': 4073,
	'previousCounts.visitors': 1412,
	showValueTooltip: true,
	'story.isLoading': false,
};
