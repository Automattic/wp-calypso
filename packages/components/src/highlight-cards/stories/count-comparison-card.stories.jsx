import { Icon, institution } from '@wordpress/icons';
import CountComparisonCard from '../count-comparison-card';

export default {
	title: 'Unaudited/Highlight Cards/CountComparisonCard',
	component: CountComparisonCard,
	argTypes: {
		heading: { control: 'text' },
		previousCount: { control: 'number' },
		count: { control: 'number' },
		showValueTooltip: { control: 'boolean' },
	},
};

const Template = ( { count, previousCount, heading } ) => {
	return (
		<div
			style={ { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
		>
			<CountComparisonCard
				heading={ heading }
				icon={ <Icon icon={ institution } /> }
				count={ count }
				previousCount={ previousCount }
			/>
		</div>
	);
};

export const CountComparisonCard_ = Template.bind( {} );
CountComparisonCard_.args = {
	heading: 'Customizable Heading',
	count: 234567,
	previousCount: 123456,
	showValueTooltip: false,
};
