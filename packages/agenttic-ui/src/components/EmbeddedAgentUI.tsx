import React, {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from 'react';
import { __ } from '@wordpress/i18n';
import type { AgentUIProps, Message, NoticeConfig, Suggestion } from '../types';
import { LightweightMarkdownRenderer } from './LightweightMarkdownRenderer';
import {
	ComplianceDisclosure,
	DefaultComplianceDisclosure,
} from './chat/ComplianceDisclosure';
import { SourcesCard } from './sources';

interface EmbeddedAgentUIContextValue extends AgentUIProps {
	inputValue: string;
	setInputValue: ( value: string ) => void;
	files: File[];
	setFiles: ( files: File[] ) => void;
	fileInputRef: React.RefObject< HTMLInputElement >;
	submit: ( message?: string ) => Promise< void >;
}

const EmbeddedAgentUIContext =
	createContext< EmbeddedAgentUIContextValue | null >( null );

function useEmbeddedAgentUIContext(): EmbeddedAgentUIContextValue {
	const context = useContext( EmbeddedAgentUIContext );
	if ( ! context ) {
		throw new Error(
			'Embedded AgentUI compound components must be rendered inside AgentUI.Container.'
		);
	}
	return context;
}

export function ThinkingMessage( { content }: { content?: string } ) {
	return (
		<div className="agenttic-embedded__thinking">
			{ content ?? __( 'Thinking…', 'a8c-agenttic' ) }
		</div>
	);
}

export function EmptyView( {
	heading,
	help,
	suggestions,
	onSuggestionClick,
}: {
	heading?: React.ReactNode;
	help?: React.ReactNode;
	suggestions?: Suggestion[];
	onSuggestionClick?: ( suggestion: Suggestion ) => void;
} ) {
	return (
		<div className="agenttic-embedded__empty">
			{ heading && <h2>{ heading }</h2> }
			{ help && <p>{ help }</p> }
			{ suggestions?.length ? (
				<div className="agenttic-embedded__suggestions">
					{ suggestions.map( ( suggestion ) => (
						<button
							key={ suggestion.id }
							type="button"
							onClick={ () => onSuggestionClick?.( suggestion ) }
						>
							{ suggestion.label }
						</button>
					) ) }
				</div>
			) : null }
		</div>
	);
}

function getRenderableBlocks( message: Message ) {
	return message.content.filter(
		( block ) => block.type === 'text' || block.type === 'component'
	);
}

function EmbeddedMessage( { message }: { message: Message } ) {
	const { messageRenderer } = useEmbeddedAgentUIContext();
	const MessageRenderer = messageRenderer ?? LightweightMarkdownRenderer;

	return (
		<div
			data-slot="message"
			data-role={ message.role }
			className={ `agenttic-embedded__message agenttic-embedded__message--${ message.role }` }
		>
			{ getRenderableBlocks( message ).map( ( block, index ) => {
				if ( block.type === 'text' && block.text ) {
					return (
						<div
							key={ index }
							className="agenttic-embedded__bubble"
						>
							<MessageRenderer>{ block.text }</MessageRenderer>
						</div>
					);
				}

				if ( block.type === 'component' && block.component ) {
					const Component = block.component;
					return (
						<Component
							key={ index }
							{ ...( block.componentProps || {} ) }
						/>
					);
				}

				return null;
			} ) }
			{ message.role === 'agent' && message.sources?.length ? (
				<SourcesCard sources={ message.sources } />
			) : null }
		</div>
	);
}

export function EmbeddedAgentUIMessages( {
	className,
}: {
	className?: string;
} = {} ) {
	const {
		messages,
		isProcessing,
		error,
		emptyView,
		thinkingMessage,
		messagesPosition,
	} = useEmbeddedAgentUIContext();
	const visibleMessages = messages.filter(
		( message ) => getRenderableBlocks( message ).length > 0
	);

	if ( visibleMessages.length === 0 && ! isProcessing ) {
		return emptyView ? (
			<div
				data-slot="messages"
				className={ [
					'agenttic-embedded__messages',
					'agenttic-embedded__messages--empty',
					className,
				]
					.filter( Boolean )
					.join( ' ' ) }
			>
				{ emptyView }
			</div>
		) : null;
	}

	return (
		<div
			data-slot="messages"
			className={ [
				'agenttic-embedded__messages',
				messagesPosition === 'bottom'
					? 'agenttic-embedded__messages--bottom'
					: '',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ visibleMessages.map( ( message ) => (
				<EmbeddedMessage
					key={ message.reactKey || message.id }
					message={ message }
				/>
			) ) }
			{ isProcessing && <ThinkingMessage content={ thinkingMessage } /> }
			{ error && (
				<div className="agenttic-embedded__error">{ error }</div>
			) }
		</div>
	);
}

export function EmbeddedAgentUISuggestions( {
	className,
	showSuggestions,
	onSelect,
}: {
	className?: string;
	showSuggestions?: boolean;
	onSelect?: ( message: string ) => void;
} = {} ) {
	const {
		inputValue,
		setInputValue,
		suggestions,
		clearSuggestions,
		onSuggestionClick,
		submit,
	} = useEmbeddedAgentUIContext();

	if ( inputValue && ! showSuggestions ) {
		return null;
	}

	if ( ! suggestions?.length ) {
		return null;
	}

	return (
		<div
			className={ [ 'agenttic-embedded__suggestions', className ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ suggestions.map( ( suggestion ) => {
				const value = suggestion.prompt ?? suggestion.label;
				return (
					<button
						key={ suggestion.id }
						type="button"
						onClick={ async () => {
							onSelect?.( value );
							onSuggestionClick?.( suggestion, suggestions );
							clearSuggestions?.();
							if ( suggestion.autoSubmit ) {
								await submit( value );
								return;
							}
							setInputValue( value );
						} }
					>
						{ suggestion.label }
					</button>
				);
			} ) }
		</div>
	);
}

export function EmbeddedAgentUINotice( {
	className,
}: {
	className?: string;
} = {} ) {
	const { notice } = useEmbeddedAgentUIContext();
	if ( ! notice ) {
		return null;
	}

	return (
		<div
			className={ [
				'agenttic-embedded__notice',
				notice.status
					? `agenttic-embedded__notice--${ notice.status }`
					: '',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<span>{ notice.message }</span>
			{ notice.action && (
				<button type="button" onClick={ notice.action.onClick }>
					{ notice.action.label }
				</button>
			) }
		</div>
	);
}

export function EmbeddedAgentUIInput( {
	className,
	disabled,
	onKeyDown,
}: {
	className?: string;
	disabled?: boolean;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
} = {} ) {
	const {
		acceptedFileTypes,
		allowAttachments,
		fileInputRef,
		files,
		inputValue,
		isProcessing,
		maxInputLength = 600,
		onStop,
		placeholder,
		setFiles,
		setInputValue,
		submit,
	} = useEmbeddedAgentUIContext();
	const canSubmit =
		! disabled &&
		( isProcessing ||
			( !! inputValue.trim() && inputValue.length <= maxInputLength ) );
	const placeholderText = Array.isArray( placeholder )
		? placeholder[ 0 ]
		: placeholder;

	return (
		<div
			data-slot="chat-input"
			className={ [ 'agenttic-embedded__input', className ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ allowAttachments && (
				<>
					<input
						ref={ fileInputRef }
						type="file"
						multiple
						accept={ acceptedFileTypes?.join( ',' ) }
						style={ { display: 'none' } }
						onChange={ ( event ) =>
							setFiles(
								Array.from( event.currentTarget.files ?? [] )
							)
						}
					/>
					<button
						type="button"
						aria-label={ __( 'Upload file', 'a8c-agenttic' ) }
						onClick={ () => fileInputRef.current?.click() }
					>
						+
					</button>
				</>
			) }
			<textarea
				aria-label={ __( 'Chat input', 'a8c-agenttic' ) }
				placeholder={ placeholderText }
				value={ inputValue }
				onChange={ ( event ) =>
					setInputValue( event.currentTarget.value )
				}
				onKeyDown={ ( event ) => {
					onKeyDown?.( event );
					if (
						! event.defaultPrevented &&
						event.key === 'Enter' &&
						! event.shiftKey &&
						canSubmit &&
						! isProcessing
					) {
						event.preventDefault();
						submit();
					}
				} }
			/>
			<button
				type="button"
				aria-label={
					isProcessing
						? __( 'Stop processing', 'a8c-agenttic' )
						: __( 'Send message', 'a8c-agenttic' )
				}
				disabled={ ! canSubmit }
				onClick={ () => {
					if ( isProcessing ) {
						onStop?.();
						return;
					}
					submit();
				} }
			>
				{ isProcessing ? '■' : '↑' }
			</button>
			{ files.length > 0 && (
				<span className="agenttic-embedded__attachment-count">
					{ files.length }
				</span>
			) }
		</div>
	);
}

export function EmbeddedAgentUIFooter( {
	children,
	className,
	complianceDisclosure = <DefaultComplianceDisclosure />,
}: {
	children?: React.ReactNode;
	className?: string;
	complianceDisclosure?: React.ReactNode | false;
} = {} ) {
	return (
		<>
			<div
				data-slot="chat-footer"
				className={ [ 'agenttic-embedded__footer', className ]
					.filter( Boolean )
					.join( ' ' ) }
			>
				{ children ?? (
					<>
						<EmbeddedAgentUISuggestions />
						<EmbeddedAgentUINotice />
						<EmbeddedAgentUIInput />
					</>
				) }
			</div>
			<ComplianceDisclosure>
				{ complianceDisclosure }
			</ComplianceDisclosure>
		</>
	);
}

export function EmbeddedAgentUIConversationView( {
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
} = {} ) {
	return (
		<div
			data-slot="conversation-view"
			className={ [ 'agenttic-embedded__conversation', className ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ children ?? (
				<>
					<EmbeddedAgentUIMessages />
					<EmbeddedAgentUIFooter />
				</>
			) }
		</div>
	);
}

export function EmbeddedAgentUIContainer( {
	children,
	className,
	...props
}: AgentUIProps & {
	children?: React.ReactNode;
} ) {
	const [ uncontrolledInputValue, setUncontrolledInputValue ] =
		useState( '' );
	const [ files, setFiles ] = useState< File[] >( [] );
	const fileInputRef = useRef< HTMLInputElement >( null );
	const inputValue = props.inputValue ?? uncontrolledInputValue;
	const setInputValue = props.onInputChange ?? setUncontrolledInputValue;

	const submit = useCallback(
		async ( explicitMessage?: string ) => {
			const message = ( explicitMessage ?? inputValue ).trim();
			if ( ! message || props.isProcessing ) {
				return;
			}
			setInputValue( '' );
			setFiles( [] );
			await props.onSubmit(
				message,
				props.allowAttachments ? files : undefined
			);
		},
		[ files, inputValue, props, setInputValue ]
	);

	const value: EmbeddedAgentUIContextValue = {
		...props,
		inputValue,
		setInputValue,
		files,
		setFiles,
		fileInputRef,
		submit,
	};

	return (
		<EmbeddedAgentUIContext.Provider value={ value }>
			<div
				data-slot="chat-embedded"
				className={ [ 'agenttic', 'agenttic-embedded', className ]
					.filter( Boolean )
					.join( ' ' ) }
			>
				{ children ?? <EmbeddedAgentUIConversationView /> }
			</div>
		</EmbeddedAgentUIContext.Provider>
	);
}

const EmbeddedAgentUINamespace = {
	Container: EmbeddedAgentUIContainer,
	ConversationView: EmbeddedAgentUIConversationView,
	Messages: EmbeddedAgentUIMessages,
	Footer: EmbeddedAgentUIFooter,
	Input: EmbeddedAgentUIInput,
	Suggestions: EmbeddedAgentUISuggestions,
	Notice: EmbeddedAgentUINotice,
};

export const EmbeddedAgentUI: React.FC< AgentUIProps > &
	typeof EmbeddedAgentUINamespace = Object.assign(
	( props: AgentUIProps ) => <EmbeddedAgentUIContainer { ...props } />,
	EmbeddedAgentUINamespace
);

export const AgentUI = EmbeddedAgentUI;

export type { AgentUIProps, Message, NoticeConfig, Suggestion };
