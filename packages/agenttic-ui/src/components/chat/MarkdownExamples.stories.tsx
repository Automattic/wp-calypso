import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { createMessageRenderer } from '@automattic/agenttic-client';
import { Messages } from './Messages';
import type { Message } from '../../types';

const meta = {
	title: 'Markdown Extensions/Custom Components',
	component: Messages,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
These examples demonstrate how to use custom React components to style markdown content.

You can provide custom components for any markdown element (blockquotes, code blocks, tables, etc.) 
to match your application's design system.

\`\`\`typescript
const customComponents = {
  blockquote: CustomBlockquote,
  code: CustomCodeBlock,
  // ... other components
};

const messageRenderer = createMessageRenderer({
  components: customComponents
});
\`\`\`
				`,
			},
		},
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
		} }
	>
		<code data-language={ language }>{ children }</code>
	</pre>
);

// Inline code component
const InlineCodeComponent = ( { children }: { children: React.ReactNode } ) => (
	<code
		style={ {
			backgroundColor: 'rgba(135, 131, 120, 0.15)',
			borderRadius: '3px',
			padding: '0.2em 0.4em',
			fontSize: '85%',
			fontFamily: 'Consolas, Monaco, "Courier New", monospace',
		} }
	>
		{ children }
	</code>
);

// Sample messages with markdown content
const markdownMessages: Message[] = [
	{
		id: '1',
		content: [
			{
				type: 'text',
				text: 'Can you share an inspiring quote?',
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
				text: `Here's one of my favorite quotes:

> The only way to do great work is to love what you do.
> If you haven't found it yet, keep looking. Don't settle.

— Steve Jobs`,
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

// Create a message renderer with GFM support and custom components
const messageRenderer = createMessageRenderer( {
	extensions: {
		gfm: { enabled: true },
	},
	components: customMarkdownComponents,
} );

export const BlockquoteExample: Story = {
	args: {
		messages: markdownMessages.slice( 0, 2 ),
		isProcessing: false,
		messageRenderer,
	},
};

export const CodeBlockExample: Story = {
	args: {
		messages: markdownMessages.slice( 2, 4 ),
		isProcessing: false,
		messageRenderer,
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

## useState
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect
\`\`\`javascript
useEffect(() => {
  // Side effects here
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`

## useContext
\`\`\`javascript
const theme = useContext(ThemeContext);
\`\`\`

> **Pro tip**: Always follow the Rules of Hooks:
> 1. Only call hooks at the top level
> 2. Only call hooks from React functions`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 20000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer,
	},
};

export const LongCodeExample: Story = {
	args: {
		messages: [
			{
				id: '7',
				content: [
					{
						type: 'text',
						text: 'Can you show me a complete React component example?',
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
						text: `Here's a complete React component with TypeScript:

\`\`\`typescript
import React, { useState, useEffect } from 'react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  initialItems?: TodoItem[];
}

export const TodoList: React.FC<TodoListProps> = ({ initialItems = [] }) => {
  const [todos, setTodos] = useState<TodoItem[]>(initialItems);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Load todos from localStorage on mount
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    // Save todos to localStorage whenever they change
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue,
          completed: false,
        },
      ]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="todo-list">
      <h2>My Todo List</h2>
      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
\`\`\`

This component demonstrates:
- TypeScript interfaces for type safety
- Multiple \`useState\` hooks for state management
- \`useEffect\` for side effects (localStorage)
- Event handling and conditional rendering
- Array manipulation with immutable updates`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer,
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
		messageRenderer,
	},
};
