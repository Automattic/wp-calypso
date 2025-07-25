import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { createMessageRenderer } from '@automattic/agenttic-client';
import { Messages } from '../../components/chat/Messages';
import type { Message } from '../../types';

const meta = {
	title: 'Markdown Extensions/GFM (GitHub Flavored Markdown)',
	component: Messages,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
GitHub Flavored Markdown (GFM) extends standard Markdown with additional features commonly used on GitHub:

- **Tables** - Create tables using pipes and hyphens
- **Strikethrough** - Use ~~double tildes~~ for strikethrough text
- **Task Lists** - Create checkboxes with \`- [ ]\` and \`- [x]\`
- **Autolinks** - URLs automatically become clickable

To enable GFM in your application:

\`\`\`typescript
const messageRenderer = createMessageRenderer({
  extensions: {
    gfm: { enabled: true }
  }
});

<AgentUI 
  messages={messages}
  messageRenderer={messageRenderer}
  // ... other props
/>
\`\`\`
				`,
			},
		},
	},
	tags: [ 'autodocs' ],
	argTypes: {
		messages: {
			control: false,
			description: 'Array of messages to display',
		},
		isProcessing: {
			control: 'boolean',
			description: 'Whether the agent is currently processing',
		},
		messageRenderer: {
			control: false,
			description: 'Custom message renderer with GFM enabled',
		},
	},
} satisfies Meta< typeof Messages >;

export default meta;
type Story = StoryObj< typeof meta >;

// Create a message renderer with GFM support
const gfmRenderer = createMessageRenderer( {
	extensions: {
		gfm: { enabled: true },
	},
} );

export const Tables: Story = {
	args: {
		messages: [
			{
				id: 'table-1',
				content: [
					{
						type: 'text',
						text: 'Can you show me a comparison table of JavaScript frameworks?',
					},
				],
				role: 'user',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
			{
				id: 'table-2',
				content: [
					{
						type: 'text',
						text: `Here's a comparison table of popular JavaScript frameworks:

| Framework | Type | Learning Curve | Performance | Community |
|-----------|------|----------------|-------------|-----------|
| React | Library | Moderate | High | Very Large |
| Vue | Framework | Easy | High | Large |
| Angular | Framework | Steep | Good | Large |
| Svelte | Compiler | Moderate | Excellent | Growing |
| Next.js | Meta-framework | Moderate | High | Large |

Each framework has its strengths:
- **React**: Flexible, component-based, large ecosystem
- **Vue**: Gentle learning curve, great documentation
- **Angular**: Full-featured, enterprise-ready
- **Svelte**: Compile-time optimizations, smaller bundle sizes
- **Next.js**: Built on React with SSR/SSG capabilities`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 5000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer: gfmRenderer,
	},
};

export const Strikethrough: Story = {
	args: {
		messages: [
			{
				id: 'strike-1',
				content: [
					{
						type: 'text',
						text: 'Can you show me how to use strikethrough text?',
					},
				],
				role: 'user',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
			{
				id: 'strike-2',
				content: [
					{
						type: 'text',
						text: `Strikethrough text is useful for showing changes or deprecated content:

- ~~Old feature~~ → New feature
- Price: ~~$99~~ **$79** (Limited time offer!)
- ~~Deprecated API endpoint~~ Use the new v2 endpoint instead

You create strikethrough text by wrapping it with double tildes: \`~~text~~\``,
					},
				],
				role: 'agent',
				created_at: Date.now() - 5000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer: gfmRenderer,
	},
};

export const TaskLists: Story = {
	args: {
		messages: [
			{
				id: 'task-1',
				content: [
					{
						type: 'text',
						text: 'Can you create a task list for implementing a new feature?',
					},
				],
				role: 'user',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
			{
				id: 'task-2',
				content: [
					{
						type: 'text',
						text: `Here's a task list for implementing user authentication:

## Implementation Checklist

- [x] Set up authentication provider
- [x] Create login/signup forms
- [x] Implement JWT token handling
- [ ] Add password reset functionality
- [ ] Set up email verification
- [ ] Add two-factor authentication
- [ ] Write unit tests
- [ ] Update documentation

### Backend Tasks
- [x] Create user model
- [x] Set up authentication endpoints
- [ ] Add rate limiting
- [ ] Implement refresh tokens

### Frontend Tasks
- [x] Create auth context
- [ ] Add protected routes
- [ ] Build profile page
- [ ] Add loading states`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 5000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer: gfmRenderer,
	},
};

export const CompleteExample: Story = {
	args: {
		messages: [
			{
				id: 'complete-1',
				content: [
					{
						type: 'text',
						text: 'Show me all GFM features in one example',
					},
				],
				role: 'user',
				created_at: Date.now() - 10000,
				archived: false,
				showIcon: true,
			},
			{
				id: 'complete-2',
				content: [
					{
						type: 'text',
						text: `# GitHub Flavored Markdown Demo

## Task Management

Here's what we need to do:

- [x] ~~Research requirements~~ ✅ Completed
- [x] Design the API
- [ ] Implement features
- [ ] Write tests

## API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| /api/users | GET | List all users | ✅ Done |
| /api/users/:id | GET | Get user by ID | ✅ Done |
| /api/users | POST | Create new user | 🚧 In Progress |
| ~~api/users/:id~~ | ~~DELETE~~ | ~~Delete user~~ | ❌ Deprecated |

## Important Links

- GitHub Repository: https://github.com/example/project
- Documentation: https://docs.example.com
- API Reference: https://api.example.com/docs

**Note**: All URLs above are automatically linkified thanks to GFM!`,
					},
				],
				role: 'agent',
				created_at: Date.now() - 5000,
				archived: false,
				showIcon: true,
			},
		],
		isProcessing: false,
		messageRenderer: gfmRenderer,
	},
};
