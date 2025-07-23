import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput } from './ChatInput';
import React, { useRef } from 'react';

const meta = {
	title: 'Chat/ChatInput',
	component: ChatInput,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
} satisfies Meta< typeof ChatInput >;

export default meta;
type Story = StoryObj< typeof meta >;

// Wrapper component to handle state for stories
const ChatInputWrapper = (
	props: Partial< React.ComponentProps< typeof ChatInput > >
) => {
	const [ value, setValue ] = React.useState( props.value || '' );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	return (
		<ChatInput
			value={ value }
			onChange={ setValue }
			onSubmit={ () => console.log( 'Submitted:', value ) }
			onKeyDown={ ( e ) => console.log( 'Key pressed:', e.key ) }
			textareaRef={ textareaRef }
			isProcessing={ false }
			{ ...props }
		/>
	);
};

export const Default: Story = {
	render: () => <ChatInputWrapper />,
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
	},
};

export const Processing: Story = {
	render: () => <ChatInputWrapper isProcessing={ true } />,
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: true,
	},
};
