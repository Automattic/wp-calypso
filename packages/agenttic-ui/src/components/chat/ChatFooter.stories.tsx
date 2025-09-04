import type { Meta, StoryObj } from '@storybook/react';
import { ChatFooter } from './ChatFooter';
import React, { useRef } from 'react';
import type { Suggestion } from '../../types';

const meta = {
	title: 'Chat/ChatFooter',
	component: ChatFooter,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		inputValue: {
			control: 'text',
			description: 'The current value of the input field',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text for the input field',
		},
		isProcessing: {
			control: 'boolean',
			description: 'Whether the chat is currently processing a request',
		},
		disabled: {
			control: 'boolean',
			description:
				'Whether the submit button should be disabled for validation',
		},
		fromCompact: {
			control: 'boolean',
			description:
				'Whether the footer is transitioning from compact view',
		},
		focusOnMount: {
			control: 'boolean',
			description:
				'Whether to focus the input field when the component mounts',
		},
		actionOrder: {
			description: 'Order of custom actions relative to submit button',
		},
		// Functions are not controllable but we can document them
		onInputChange: {
			action: 'inputChanged',
			description: 'Callback when input value changes',
		},
		onSubmit: {
			action: 'submitted',
			description: 'Callback when form is submitted',
		},
		onKeyDown: {
			action: 'keyPressed',
			description: 'Callback when key is pressed in input',
		},
		onStop: {
			action: 'stopped',
			description: 'Callback to stop processing',
		},
		onExpand: {
			action: 'expanded',
			description: 'Callback when expand button is clicked',
		},
		clearSuggestions: {
			action: 'suggestionsCleared',
			description: 'Callback to clear suggestions',
		},
	},
} satisfies Meta< typeof ChatFooter >;

export default meta;
type Story = StoryObj< typeof meta >;

// Mock suggestions for stories
const mockSuggestions: Suggestion[] = [
	{
		id: '1',
		label: 'Website Performance',
		prompt: 'How can I improve my website performance?',
	},
	{
		id: '2',
		label: 'Web Development Trends',
		prompt: 'What are the latest web development trends?',
	},
	{
		id: '3',
		label: 'Responsive Design',
		prompt: 'Can you help me with responsive design?',
	},
];

// Wrapper component to handle state for stories
const ChatFooterWrapper = (
	args: React.ComponentProps< typeof ChatFooter >
) => {
	const [ inputValue, setInputValue ] = React.useState(
		args.inputValue || ''
	);
	const [ suggestions, setSuggestions ] = React.useState(
		args.suggestions || mockSuggestions
	);
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	// Update state when args change
	React.useEffect( () => {
		setInputValue( args.inputValue || '' );
	}, [ args.inputValue ] );

	React.useEffect( () => {
		setSuggestions( args.suggestions || mockSuggestions );
	}, [ args.suggestions ] );

	return (
		<ChatFooter
			{ ...args }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			onSubmit={ () => console.log( 'Submitted:', inputValue ) }
			onKeyDown={ ( e ) => console.log( 'Key pressed:', e.key ) }
			textareaRef={ textareaRef }
			suggestions={ suggestions }
			clearSuggestions={ () => setSuggestions( [] ) }
			onStop={ () => console.log( 'Stopped processing' ) }
			onExpand={ () => console.log( 'Expand clicked' ) }
		/>
	);
};

export const Default: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		inputValue: '',
		placeholder: 'Ask me anything...',
		isProcessing: false,
		disabled: false,
		fromCompact: false,
		focusOnMount: false,
		actionOrder: 'before-submit',
		suggestions: mockSuggestions,
		onInputChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
	},
};

export const WithSuggestions: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		...Default.args,
		inputValue: '',
		suggestions: mockSuggestions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows suggestions when the input is empty. Users can click on suggestions to populate the input field.',
			},
		},
	},
};

export const Processing: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		...Default.args,
		inputValue: 'Processing your request...',
		isProcessing: true,
		suggestions: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the processing state with a stop button instead of submit button.',
			},
		},
	},
};

export const DisabledSubmit: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		...Default.args,
		inputValue: 'This message cannot be submitted',
		disabled: true,
		suggestions: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'The submit button is disabled when the `disabled` prop is set to true, even if there is text in the input field. This is useful for form validation scenarios where you want to prevent submission until certain criteria are met.',
			},
		},
	},
};

export const FromCompact: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		...Default.args,
		inputValue: 'Transitioning from compact view',
		fromCompact: true,
		suggestions: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the footer when transitioning from compact view, with different animation timing.',
			},
		},
	},
};

export const WithNotice: Story = {
	render: ( args ) => <ChatFooterWrapper { ...args } />,
	args: {
		...Default.args,
		inputValue: '',
		notice: {
			icon: '💡',
			message: 'This is a helpful notice that appears above the input.',
			dismissible: true,
			onDismiss: () => console.log( 'Notice dismissed' ),
		},
		suggestions: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows a notice above the input field. Notices can be dismissible or persistent.',
			},
		},
	},
};

// Wrapper component for interactive validation demo
const ValidationDemoWrapper = () => {
	const [ inputValue, setInputValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( false );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	// Validation rules: must contain at least one word that's 3+ characters long
	React.useEffect( () => {
		const words = inputValue.trim().split( /\s+/ );
		const hasValidWord = words.some( ( word ) => word.length >= 3 );
		setIsValid( hasValidWord );
	}, [ inputValue ] );

	const notice = {
		icon: isValid ? '✅' : '⚠️',
		message: isValid
			? 'Message is ready to send!'
			: 'Please enter at least one word with 3 or more characters.',
		dismissible: false,
	};

	return (
		<div style={ { maxWidth: '600px' } }>
			<ChatFooter
				inputValue={ inputValue }
				onInputChange={ setInputValue }
				onSubmit={ () => {
					console.log( 'Submitted:', inputValue );
					setInputValue( '' );
				} }
				onKeyDown={ ( e ) => console.log( 'Key pressed:', e.key ) }
				textareaRef={ textareaRef }
				isProcessing={ false }
				disabled={ ! isValid }
				notice={ notice }
				placeholder="Type a message with at least one 3+ character word..."
				suggestions={
					inputValue
						? []
						: [
								{
									id: '1',
									label: 'Greeting',
									prompt: 'Hello there!',
								},
								{
									id: '2',
									label: 'Help Request',
									prompt: 'Can you help me?',
								},
								{
									id: '3',
									label: 'Introduction',
									prompt: 'What is your name?',
								},
						  ]
				}
				clearSuggestions={ () => {} }
			/>
		</div>
	);
};

export const DisabledWithValidation: Story = {
	render: () => <ValidationDemoWrapper />,
	args: {
		...Default.args,
		inputValue: '',
		disabled: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive example showing how the `disabled` prop can be used for form validation. The submit button is disabled until the input meets validation criteria. This example also demonstrates the notice system and suggestions integration.',
			},
		},
		controls: {
			disable: true, // Disable controls for this interactive demo
		},
	},
};
