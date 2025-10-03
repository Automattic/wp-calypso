import { Icon, institution } from '@wordpress/icons';
import CountCard from '../count-card';

export default {
	title: 'My Sites/Stats/Highlight Cards/CountCard',
	component: CountCard,
	argTypes: {
		heading: { control: 'text' },
		valueType: {
			control: { type: 'radio' },
			options: [ 'number', 'string' ],
		},
		stringValue: { control: 'text' },
		numberValue: { control: 'number' },
	},
};

const Template = ( args ) => {
	const value = args.valueType === 'string' ? args.stringValue : args.numberValue;

	return (
		<div
			style={ { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
		>
			<CountCard heading={ args.heading } icon={ <Icon icon={ institution } /> } value={ value } />
		</div>
	);
};

export const CountCard_ = Template.bind( {} );
CountCard_.args = {
	heading: 'Customizable Heading',
	valueType: 'number',
	stringValue: 'A really long string message that forces the box to expand',
	numberValue: 12345,
};
