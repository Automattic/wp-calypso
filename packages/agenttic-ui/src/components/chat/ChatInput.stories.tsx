import type { Meta, StoryObj } from '@storybook/react';
import { type ActionButton, ChatInput } from './ChatInput';
import React, { useRef } from 'react';
import { CopyIcon } from '../icons/CopyIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { PageIcon } from '../icons/PageIcon';
import { StylesIcon } from '../icons/StylesIcon';
import { CheckIcon } from '../icons/CheckIcon';

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

export const WithExpandButton: Story = {
	render: () => (
		<ChatInputWrapper
			showExpandButton={ true }
			onExpand={ () => console.log( 'Expand clicked!' ) }
		/>
	),
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
	},
};

const customActions: ActionButton[] = [
	{
		id: 'attach-file',
		icon: <PageIcon />,
		onClick: () => console.log( 'Attach file clicked!' ),
		variant: 'ghost',
		'aria-label': 'Attach file',
	},
	{
		id: 'add-image',
		icon: <ImageIcon />,
		onClick: () => console.log( 'Add image clicked!' ),
		variant: 'icon',
		'aria-label': 'Add image',
	},
	{
		id: 'copy-text',
		icon: <CopyIcon />,
		onClick: () => console.log( 'Copy text clicked!' ),
		variant: 'link',
		'aria-label': 'Copy text',
	},
	{
		id: 'style-text',
		icon: <StylesIcon />,
		onClick: () => console.log( 'Style text clicked!' ),
		variant: 'icon',
		'aria-label': 'Style text',
	},
	{
		id: 'check-icon',
		icon: <CheckIcon />,
		onClick: () => console.log( 'Check icon clicked!' ),
		variant: 'primary',
		'aria-label': 'Check icon',
	},
];

export const WithCustomActions: Story = {
	render: () => {
		return (
			<ChatInputWrapper
				customActions={ customActions }
				actionOrder="before-submit"
			/>
		);
	},
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
	},
};

export const WithCustomActionsAfterSubmit: Story = {
	render: () => {
		return (
			<ChatInputWrapper
				customActions={ customActions }
				actionOrder="after-submit"
			/>
		);
	},
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
	},
};
