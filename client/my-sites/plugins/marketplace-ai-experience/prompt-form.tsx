// Conversational prompt input for the discover-page empty state. Uses
// the same ChatInput + Suggestions primitives as the Odie/Big Sky chat
// surface so the affordance matches the dock the user is already
// interacting with.

import '@automattic/agenttic-ui/index.css';
import { AgentUIProvider, ChatInput, Suggestions, type Suggestion } from '@automattic/agenttic-ui';
import { useMemo, useRef, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

import './prompt-form.scss';

interface PromptFormProps {
	onSubmit: ( prompt: string ) => void;
	mode?: 'initial' | 'followup';
}

export default function PromptForm( { onSubmit, mode = 'initial' }: PromptFormProps ): JSX.Element {
	const translate = useTranslate();
	const [ value, setValue ] = useState( '' );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	const submit = ( prompt: string ) => {
		const trimmed = prompt.trim();
		if ( ! trimmed ) {
			return;
		}

		onSubmit( trimmed );
		setValue( '' );
	};

	const suggestions: Suggestion[] = useMemo( () => {
		if ( mode === 'followup' ) {
			return [
				{
					id: 'most-popular',
					label: translate( 'Most popular' ),
					prompt: translate( 'Show me the most popular options.' ),
				},
				{
					id: 'alternatives',
					label: translate( 'Alternatives' ),
					prompt: translate( 'Show me some alternatives.' ),
				},
				{
					id: 'best-rated',
					label: translate( 'Best rated' ),
					prompt: translate( 'Show me the highest-rated options.' ),
				},
			];
		}
		return [
			{
				id: 'contact-form',
				label: translate( 'Collect leads with a form' ),
				prompt: translate( 'I need a contact form to collect leads from visitors.' ),
			},
			{
				id: 'newsletter',
				label: translate( 'Send marketing emails' ),
				prompt: translate( 'I want to send email newsletters to my subscribers.' ),
			},
			{
				id: 'seo',
				label: translate( 'Rank higher in search results' ),
				prompt: translate( 'Help me rank higher in Google search results.' ),
			},
			{
				id: 'analytics',
				label: translate( 'Track visitor analytics' ),
				prompt: translate( 'I want to track visitor analytics on my site.' ),
			},
			{
				id: 'commerce',
				label: translate( 'Sell products online' ),
				prompt: translate( 'I want to sell physical products through my site.' ),
			},
		];
	}, [ translate, mode ] );

	const handleKeyDown = ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
		if ( e.key === 'Enter' && ! e.shiftKey ) {
			e.preventDefault();
			submit( value );
		}
	};

	// Chips fill the input rather than auto-submitting — matches the
	// Big Sky pattern. User can edit before hitting send.
	const handleSuggestionClick = ( s: Suggestion ) => {
		setValue( s.prompt ?? s.label );
		textareaRef.current?.focus();
	};

	return (
		<AgentUIProvider value={ {} as never }>
			<div className="prompt-form agenttic">
				<ChatInput
					value={ value }
					onChange={ setValue }
					onSubmit={ () => submit( value ) }
					onKeyDown={ handleKeyDown }
					textareaRef={ textareaRef }
					isProcessing={ false }
					// Cycle the suggestion prompts through the placeholder so
					// the input keeps suggesting examples without the user
					// having to read the chips.
					placeholder={ suggestions.map( ( s ) => s.prompt ?? s.label ) }
				/>
				<Suggestions
					suggestions={ suggestions }
					layout="horizontal"
					visible
					translateY={ 0 }
					onSubmit={ handleSuggestionClick }
				/>
			</div>
		</AgentUIProvider>
	);
}
