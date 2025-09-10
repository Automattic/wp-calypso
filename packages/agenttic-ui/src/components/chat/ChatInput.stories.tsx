import type { Meta, StoryObj } from '@storybook/react';
import { type ActionButton, ChatInput } from './ChatInput';
import React, { useRef } from 'react';
import { CopyIcon } from '../icons/CopyIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { PageIcon } from '../icons/PageIcon';
import { StylesIcon } from '../icons/StylesIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { AgentUI } from '../AgentUI';

const meta = {
	title: 'Chat/ChatInput',
	component: ChatInput,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	decorators: [
		( Story, context ) => (
			<AgentUI.Container
				messages={ [] }
				isProcessing={ Boolean( context.args?.isProcessing ) }
				onSubmit={ () => {} }
				variant="embedded"
			>
				<Story />
			</AgentUI.Container>
		),
	],
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

export const DisabledSubmit: Story = {
	render: () => <ChatInputWrapper disabled={ true } />,
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
		disabled: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'The submit button is disabled when the `disabled` prop is set to true, even if there is text in the input field. This is useful for form validation scenarios.',
			},
		},
	},
};

// Wrapper component for interactive disabled demo
const DisabledValidationWrapper = () => {
	const [ value, setValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( false );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	// Simple validation: require at least 5 characters
	React.useEffect( () => {
		setIsValid( value.trim().length >= 5 );
	}, [ value ] );

	return (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '16px' } }
		>
			<div style={ { fontSize: '14px', color: '#666' } }>
				<strong>Validation Demo:</strong> Submit button is disabled
				until you type at least 5 characters.
			</div>
			<ChatInput
				value={ value }
				onChange={ setValue }
				onSubmit={ () => console.log( 'Submitted:', value ) }
				onKeyDown={ ( e ) => console.log( 'Key pressed:', e.key ) }
				textareaRef={ textareaRef }
				isProcessing={ false }
				disabled={ ! isValid }
				placeholder="Type at least 5 characters to enable submit..."
			/>
			<div
				style={ {
					fontSize: '12px',
					color: isValid ? '#22c55e' : '#ef4444',
				} }
			>
				{ isValid
					? '✓ Valid input'
					: `✗ Need ${ 5 - value.trim().length } more characters` }
			</div>
		</div>
	);
};

export const DisabledWithValidation: Story = {
	render: () => <DisabledValidationWrapper />,
	args: {
		value: '',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive example showing how the `disabled` prop can be used for form validation. The submit button is disabled until the input meets validation criteria (5+ characters in this example).',
			},
		},
	},
};
