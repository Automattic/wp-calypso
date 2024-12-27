import { BaseTooltip } from '../index';
import type { Meta } from '@storybook/react';

const CustomTooltipContent = ( { data } ) => (
	<div style={ { padding: '8px' } }>
		<strong style={ { display: 'block', marginBottom: '4px' } }>{ data.label }</strong>
		<div style={ { color: '#888' } }>Value: { data.value }</div>
	</div>
);

export default {
	title: 'JS Packages/Charts/Composites/Tooltip',
	component: BaseTooltip,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A flexible tooltip component that can display data with custom styling and layout.',
			},
		},
	},
	argTypes: {
		data: {
			description: 'The data object containing label and value',
			control: 'object',
		},
		top: {
			description: 'Distance from top of container',
			control: { type: 'range', min: 0, max: 200 },
		},
		left: {
			description: 'Distance from left of container',
			control: { type: 'range', min: 0, max: 200 },
		},
		style: {
			description: 'Additional CSS styles to apply',
			control: 'object',
		},
	},
} satisfies Meta< typeof BaseTooltip >;

const Template = args => (
	<div
		style={ {
			position: 'relative',
			padding: '2rem',
			border: '1px dashed #ccc',
			width: '300px',
			height: '200px',
			background: '#f5f5f5',
		} }
	>
		<BaseTooltip { ...args } />
	</div>
);

export const Default = Template.bind( {} );
Default.args = {
	top: 100,
	left: 100,
	data: {
		label: 'Monthly Sales',
		value: 4200,
	},
};

export const CustomComponent = Template.bind( {} );
CustomComponent.args = {
	...Default.args,
	component: CustomTooltipContent,
	data: {
		label: 'Q4 Performance',
		value: 27,
	},
	style: {
		backgroundColor: '#fff',
		color: '#333',
		boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
	},
};
