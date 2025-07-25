import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Messages } from './Messages';
import type { Message } from '../../types';

const meta = {
	title: 'Chat/Markdown Examples',
	component: Messages,
	parameters: {
		layout: 'fullscreen',
	},
	tags: [ 'autodocs' ],
} satisfies Meta< typeof Messages >;

export default meta;
type Story = StoryObj< typeof meta >;

// Custom blockquote component matching the demo styling
const BlockquoteComponent = ( { children }: { children: React.ReactNode } ) => (
	<blockquote
		style={ {
			borderLeft: '4px solid #007cba',
			backgroundColor: '#f0f8ff',
			margin: '16px 0',
			padding: '12px 16px',
			fontStyle: 'italic',
			borderRadius: '0 4px 4px 0',
		} }
	>
		{ children }
	</blockquote>
);

// Code block component with syntax highlighting styling
const CodeBlockComponent = ( {
	children,
	language = 'text',
}: {
	children: React.ReactNode;
	language?: string;
} ) => (
	<pre
		style={ {
			backgroundColor: '#f6f8fa',
			borderRadius: '6px',
			padding: '16px',
			overflow: 'auto',
			fontFamily: 'Consolas, Monaco, "Courier New", monospace',
			fontSize: '14px',
			lineHeight: '1.45',
			margin: '16px 0',
		} }
	>
		<code data-language={ language }>{ children }</code>
	</pre>
);

// Inline code component
const InlineCodeComponent = ( { children }: { children: React.ReactNode } ) => (
	<code
		style={ {
			backgroundColor: '#f3f4f6',
			borderRadius: '3px',
			padding: '2px 4px',
			fontFamily: 'Consolas, Monaco, "Courier New", monospace',
			fontSize: '85%',
		} }
	>
		{ children }
	</code>
);

// Example messages with actual markdown text
const markdownMessages: Message[] = [
	{
		id: '1',
		content: [
			{
				type: 'text',
				text: 'Show me an Einstein quote in markdown block quote format',
			},
		],
		role: 'user',
		created_at: Date.now() - 120000,
		archived: false,
		showIcon: true,
	},
	{
		id: '2',
		content: [
			{
				type: 'text',
				text: `Here's a famous Einstein quote:

> Imagination is more important than knowledge. Knowledge
> is limited. Imagination embraces the entire world,
> stimulating progress, giving birth to evolution.

— Albert Einstein`,
			},
		],
		role: 'agent',
		created_at: Date.now() - 100000,
		archived: false,
		showIcon: true,
	},
	{
		id: '3',
		content: [
			{
				type: 'text',
				text: 'Can you show me a JavaScript code example?',
			},
		],
		role: 'user',
		created_at: Date.now() - 80000,
		archived: false,
		showIcon: true,
	},
	{
		id: '4',
		content: [
			{
				type: 'text',
				text: `Here's a simple JavaScript function:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to the chat, \${name}\`;
}

// Usage
const message = greet('World');
console.log(message);
\`\`\`

This function demonstrates template literals and console logging.`,
			},
		],
		role: 'agent',
		created_at: Date.now() - 60000,
		archived: false,
		showIcon: true,
	},
];

// Custom markdown components to style the rendered markdown
const customMarkdownComponents = {
	blockquote: ( { children }: any ) => (
		<BlockquoteComponent>{ children }</BlockquoteComponent>
	),
	code: ( { inline, children, className }: any ) => {
		const language = className?.replace( 'language-', '' );
		return inline ? (
			<InlineCodeComponent>{ children }</InlineCodeComponent>
		) : (
			<CodeBlockComponent language={ language }>
				{ children }
			</CodeBlockComponent>
		);
	},
};

export const BlockquoteExample: Story = {
	args: {
		messages: markdownMessages.slice( 0, 2 ),
		isProcessing: false,
		markdownComponents: customMarkdownComponents,
	},
};

export const CodeBlockExample: Story = {
	args: {
		messages: markdownMessages.slice( 2, 4 ),
		isProcessing: false,
		markdownComponents: customMarkdownComponents,
	},
};

export const MixedMarkdownContent: Story = {
	args: {
		messages: [
			...markdownMessages,
			{
				id: '5',
				content: [
					{
						type: 'text',
						text: 'Can you explain React hooks with examples?',
					},
				],
				role: 'user',
				created_at: Date.now() - 40000,
				archived: false,
				showIcon: true,
			},
			{
				id: '6',
				content: [
					{
						type: 'text',
						text: `React hooks are functions that let you use state and other React features in functional components. Here are the most common ones:

### 1. useState

The \`useState\` hook lets you add state to functional components:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

### 2. useEffect

The \`useEffect\` hook performs side effects:

\`\`\`jsx
useEffect(() => {
  // This runs after every render
  document.title = \`Count: \${count}\`;

  // Cleanup function (optional)
  return () => {
    console.log('Cleanup');
  };
}, [count]); // Dependency array
\`\`\`

> Remember: Hooks must be called at the top level
> of your component, not inside conditions, loops,
> or nested functions.`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 20000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		markdownComponents: customMarkdownComponents,
	},
};

export const CodeWithMultipleLanguages: Story = {
	args: {
		messages: [
			{
				id: '7',
				content: [
					{
						type: 'text',
						text: 'Show me the same logic in Python and JavaScript',
					},
				],
				role: 'user',
				created_at: Date.now() - 30000,
				archived: false,
				showIcon: true,
			},
			{
				id: '8',
				content: [
					{
						type: 'text',
						text: `Here's a function to calculate factorial in both languages:

#### JavaScript:

\`\`\`javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
\`\`\`

#### Python:

\`\`\`python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\``,
					},
				],
				role: 'agent',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		markdownComponents: customMarkdownComponents,
	},
};

export const NestedQuotes: Story = {
	args: {
		messages: [
			{
				id: '9',
				content: [
					{
						type: 'text',
						text: 'Can you share some programming wisdom?',
					},
				],
				role: 'user',
				created_at: Date.now() - 20000,
				archived: false,
				showIcon: true,
			},
			{
				id: '10',
				content: [
					{
						type: 'text',
						text: `Here are some timeless programming quotes:

> Programs must be written for people to read, and
> only incidentally for machines to execute.

— Harold Abelson

> Any fool can write code that a computer can
> understand. Good programmers write code that
> humans can understand.

— Martin Fowler

> The best way to predict the future is to invent
> it.

— Alan Kay`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 5000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		markdownComponents: customMarkdownComponents,
	},
};
