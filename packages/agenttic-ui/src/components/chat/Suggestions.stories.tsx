import type { Meta, StoryObj } from '@storybook/react';
import { Suggestions } from './Suggestions';
import { MockProviders } from '../../mocks/providers';
import { useEffect } from 'react';
import { useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../../store';
import type { StoreActions } from '../../types';

const meta = {
	title: 'Chat/Suggestions',
	component: Suggestions,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	decorators: [
		( Story ) => (
			<MockProviders>
				<Story />
			</MockProviders>
		),
	],
} satisfies Meta< typeof Suggestions >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	parameters: {
		docs: {
			story: {
				inline: false,
				height: '250px',
			},
		},
	},
	render: () => (
		<div
			style={ {
				width: '100%',
				height: '200px',
				position: 'relative',
				backgroundColor: '#f5f5f5',
				borderRadius: '8px',
				padding: '1rem',
			} }
		>
			<div
				style={ {
					position: 'absolute',
					bottom: '1rem',
					left: '1rem',
					right: '1rem',
				} }
			>
				<Suggestions />
			</div>
		</div>
	),
};

const EmptySuggestions = () => {
	const { registerSuggestions } = useDispatch( STORE_NAME ) as StoreActions;

	useEffect( () => {
		registerSuggestions( [] );

		return () => {
			registerSuggestions( [
				{
					id: '1',
					prompt: 'Show me my site analytics',
					label: 'Site Analytics',
				},
				{
					id: '2',
					prompt: 'Help me optimize my content',
					label: 'Content Help',
				},
			] );
		};
	}, [ registerSuggestions ] );

	return <Suggestions />;
};

export const Empty: Story = {
	render: () => (
		<div
			style={ {
				width: '400px',
				height: '200px',
				position: 'relative',
				backgroundColor: '#f5f5f5',
				borderRadius: '8px',
				padding: '1rem',
			} }
		>
			<p
				style={ {
					color: '#666',
					textAlign: 'center',
					marginTop: '3rem',
				} }
			>
				Empty state - no suggestions to display
			</p>
			<div
				style={ {
					position: 'absolute',
					bottom: '1rem',
					left: '1rem',
					right: '1rem',
				} }
			>
				<EmptySuggestions />
			</div>
		</div>
	),
};
