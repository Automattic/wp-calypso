import React, { useCallback, useState } from 'react';
import type { Message as ClientMessage } from '@automattic/agenttic-client';
import { ToolDropdown } from './playground/ToolDropdown';

interface MessageTesterProps {
	addMessage: ( message: any ) => void;
	loadMessages?: ( messages: ClientMessage[] ) => void | Promise< void >;
	onClear?: () => void;
}

type Preset =
	| { label: string; role: 'user' | 'agent'; text: string }
	| { label: string; createMessages: () => ClientMessage[] };

const createRegenerateExampleMessages = (): ClientMessage[] => {
	const timestamp = Date.now();

	return [
		{
			messageId: 'regenerate-demo-user',
			role: 'user',
			kind: 'message',
			parts: [
				{
					type: 'text',
					text: 'Generate five blog post title options about flowers.',
				},
			],
			metadata: { timestamp },
		},
		{
			messageId: 'regenerate-demo-agent',
			role: 'agent',
			kind: 'message',
			parts: [
				{
					type: 'text',
					text: [
						'Here are some options:',
						'',
						'- Petals and Poetry: The Art of Floral Expression',
						'- Blooming Wonders: Exploring the Magic of Flowers',
						'- Flowers and Words: The Fun of Floral Art',
						'- From Seed to Splendor: Understanding Flower Growth',
						'- Colors of Nature: The Science Behind Flower Hues',
					].join( '\n' ),
				},
			],
			metadata: { timestamp: timestamp + 1 },
		},
	];
};

const REGENERATE_PRESET: Preset = {
	label: 'Regenerate',
	createMessages: createRegenerateExampleMessages,
};

const PRESETS: Preset[] = [
	{
		label: 'Chart',
		role: 'agent',
		text:
			"Here's a chart:\n\n```chart\n" +
			JSON.stringify( {
				chartType: 'bar',
				title: 'Top Products by Sales',
				mode: 'item-comparison',
				data: [
					{
						label: 'Product A',
						data: [
							{ label: 'Q1', value: 5000 },
							{ label: 'Q2', value: 6200 },
							{ label: 'Q3', value: 5800 },
						],
					},
					{
						label: 'Product B',
						data: [
							{ label: 'Q1', value: 3100 },
							{ label: 'Q2', value: 4300 },
							{ label: 'Q3', value: 4700 },
						],
					},
				],
			} ) +
			'\n```',
	},
	{
		label: 'Code Blocks',
		role: 'agent',
		text: `Inline code like \`wp_get_current_user()\` should sit on its own surface, distinct from prose.

A short fenced block:

\`\`\`javascript
const greeting = 'Hello, world!';
console.log( greeting );
\`\`\`

A long single line that must scroll horizontally instead of widening the bubble:

\`\`\`sql
SELECT p.ID, p.post_title, p.post_date, u.display_name FROM wp_posts AS p INNER JOIN wp_users AS u ON u.ID = p.post_author WHERE p.post_status = 'publish' AND p.post_type = 'post' ORDER BY p.post_date DESC LIMIT 20;
\`\`\`

Unlabeled block with no language:

\`\`\`
$ pnpm install
$ pnpm dev
\`\`\`

Inline code inside a list and a table:

1. Run \`pnpm build\` first
2. Then \`pnpm test\`

| Token | Value |
|-------|-------|
| \`--color-muted\` | code surface |
| \`--font-mono\` | code family |`,
	},
	{
		label: 'Rich Markdown',
		role: 'agent',
		text: `## Getting Started

Here's a quick overview of the **key features**:

1. **Real-time sync** — changes are reflected instantly
2. **Markdown support** — full GFM compatibility
3. **Code highlighting** — works with most languages

### Example Code

\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

> This is a blockquote with some *important* context.

| Feature | Status |
|---------|--------|
| Tables | Supported |
| Links | [Yes](https://example.com) |
| Inline code | \`supported\` |

That's it for now. Let me know if you have questions!`,
	},
];

const MessageTester: React.FC< MessageTesterProps > = ( {
	addMessage,
	loadMessages,
	onClear,
} ) => {
	const [ role, setRole ] = useState< 'user' | 'agent' >( 'agent' );
	const [ text, setText ] = useState( '' );
	const presets = loadMessages ? [ REGENERATE_PRESET, ...PRESETS ] : PRESETS;

	const injectMessage = useCallback(
		( messageRole: 'user' | 'agent', messageText: string ) => {
			addMessage( {
				id: crypto.randomUUID(),
				role: messageRole,
				content: [ { type: 'text', text: messageText } ],
				timestamp: Date.now(),
				archived: false,
				showIcon: true,
			} );
		},
		[ addMessage ]
	);

	const handleSubmit = useCallback( () => {
		if ( ! text.trim() ) {
			return;
		}
		injectMessage( role, text );
		setText( '' );
	}, [ role, text, injectMessage ] );

	const handlePreset = useCallback(
		( preset: Preset ) => {
			if ( 'createMessages' in preset ) {
				if ( loadMessages ) {
					void loadMessages( preset.createMessages() );
				}
				return;
			}

			injectMessage( preset.role, preset.text );
		},
		[ injectMessage, loadMessages ]
	);

	return (
		<ToolDropdown label="Messages">
			{ ( { close } ) => (
				<div className="message-tester">
					<div className="message-tester__row">
						<select
							className="message-tester__select"
							value={ role }
							onChange={ ( e ) =>
								setRole( e.target.value as 'user' | 'agent' )
							}
						>
							<option value="agent">Agent</option>
							<option value="user">User</option>
						</select>
					</div>

					<textarea
						className="message-tester__textarea"
						value={ text }
						onChange={ ( e ) => setText( e.target.value ) }
						placeholder="Type your message... (supports markdown)"
					/>

					<div className="message-tester__actions">
						{ onClear && (
							<button
								type="button"
								className="playground-tool is-accent"
								onClick={ onClear }
							>
								Clear Chat
							</button>
						) }
						<button
							type="button"
							className="playground-tool"
							onClick={ handleSubmit }
							disabled={ ! text.trim() }
						>
							Send
						</button>
					</div>

					<div className="message-tester__presets">
						<div className="message-tester__presets-label">
							Presets
						</div>
						<div className="message-tester__presets-list">
							{ presets.map( ( preset ) => (
								<button
									type="button"
									key={ preset.label }
									className="playground-tool"
									onClick={ () => {
										handlePreset( preset );
										close();
									} }
								>
									{ preset.label }
								</button>
							) ) }
						</div>
					</div>
				</div>
			) }
		</ToolDropdown>
	);
};

export default MessageTester;
