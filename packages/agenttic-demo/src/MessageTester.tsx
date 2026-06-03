import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Message as ClientMessage } from '@automattic/agenttic-client';

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

const buttonStyle: React.CSSProperties = {
	padding: '8px 10px',
	background: '#007cba',
	color: '#fff',
	cursor: 'pointer',
	fontSize: '12px',
	fontFamily: 'monospace',
	textTransform: 'uppercase',
	border: 'none',
	marginInline: '10px',
};

const MessageTester: React.FC< MessageTesterProps > = ( {
	addMessage,
	loadMessages,
	onClear,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ role, setRole ] = useState< 'user' | 'agent' >( 'agent' );
	const [ text, setText ] = useState( '' );
	const dropdownRef = useRef< HTMLDivElement >( null );
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
				setIsOpen( false );
				return;
			}

			injectMessage( preset.role, preset.text );
			setIsOpen( false );
		},
		[ injectMessage, loadMessages ]
	);

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		const handleClickOutside = ( e: MouseEvent ) => {
			if (
				dropdownRef.current &&
				! dropdownRef.current.contains( e.target as Node )
			) {
				setIsOpen( false );
			}
		};

		const handleEscape = ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' ) {
				setIsOpen( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );
		document.addEventListener( 'keydown', handleEscape );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
			document.removeEventListener( 'keydown', handleEscape );
		};
	}, [ isOpen ] );

	return (
		<div ref={ dropdownRef } style={ { position: 'relative' } }>
			<button
				onClick={ () => setIsOpen( ! isOpen ) }
				style={ buttonStyle }
			>
				Messages { isOpen ? '\u25B4' : '\u25BE' }
			</button>

			{ isOpen && (
				<div
					style={ {
						position: 'absolute',
						top: '100%',
						right: 0,
						width: '320px',
						background: '#fff',
						border: '1px solid #ccc',
						borderRadius: '4px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
						zIndex: 10001,
						padding: '12px',
						fontFamily: 'monospace',
						fontSize: '12px',
					} }
				>
					<div
						style={ {
							display: 'flex',
							gap: '8px',
							marginBottom: '8px',
						} }
					>
						<select
							value={ role }
							onChange={ ( e ) =>
								setRole( e.target.value as 'user' | 'agent' )
							}
							style={ {
								padding: '4px 8px',
								fontSize: '12px',
								fontFamily: 'monospace',
								border: '1px solid #ccc',
								borderRadius: '3px',
								background: '#fff',
							} }
						>
							<option value="agent">Agent</option>
							<option value="user">User</option>
						</select>
					</div>

					<textarea
						value={ text }
						onChange={ ( e ) => setText( e.target.value ) }
						placeholder="Type your message... (supports markdown)"
						style={ {
							width: '100%',
							height: '80px',
							padding: '8px',
							fontSize: '12px',
							fontFamily: 'monospace',
							border: '1px solid #ccc',
							borderRadius: '3px',
							resize: 'vertical',
							boxSizing: 'border-box',
						} }
					/>

					<div
						style={ {
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '4px',
							marginTop: '8px',
						} }
					>
						{ onClear && (
							<button
								onClick={ onClear }
								style={ {
									...buttonStyle,
									background: '#d63638',
								} }
							>
								Clear Chat
							</button>
						) }
						<button
							onClick={ handleSubmit }
							disabled={ ! text.trim() }
							style={ {
								...buttonStyle,
								opacity: text.trim() ? 1 : 0.5,
								cursor: text.trim() ? 'pointer' : 'not-allowed',
							} }
						>
							Send
						</button>
					</div>

					<div
						style={ {
							borderTop: '1px solid #eee',
							marginTop: '12px',
							paddingTop: '8px',
						} }
					>
						<div
							style={ {
								fontSize: '10px',
								textTransform: 'uppercase',
								color: '#999',
								marginBottom: '6px',
								letterSpacing: '0.5px',
							} }
						>
							Presets
						</div>
						<div
							style={ {
								display: 'flex',
								gap: '4px',
								flexWrap: 'wrap',
							} }
						>
							{ presets.map( ( preset ) => (
								<button
									key={ preset.label }
									onClick={ () => handlePreset( preset ) }
									style={ {
										padding: '3px 8px',
										fontSize: '11px',
										fontFamily: 'monospace',
										background: '#f0f0f0',
										border: '1px solid #ddd',
										borderRadius: '3px',
										cursor: 'pointer',
										color: '#333',
									} }
								>
									{ preset.label }
								</button>
							) ) }
						</div>
					</div>
				</div>
			) }
		</div>
	);
};

export default MessageTester;
