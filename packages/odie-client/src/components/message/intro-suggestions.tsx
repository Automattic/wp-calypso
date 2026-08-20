import { Suggestions } from '@automattic/agenttic-ui';
import clsx from 'clsx';
import { useState } from 'react';
import { PLANS_PRESALES_LAUNCHER_CONTEXT } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import type { Message } from '../../types';
import './intro-suggestions.scss';

/**
 * EXPERIMENT (Ilona, 2026-08-20): starter-prompt chips for the plans-presales
 * assistant, rendered with agenttic-ui's Suggestions component.
 *
 * Two modes, one component:
 * - Before the conversation starts: vertical stacked list under the greeting.
 * - Once a prompt is chosen (or the visitor types): the not-yet-asked prompts
 *   move into a compact horizontal follow-up row above the composer.
 * Clicking marks the prompt as asked locally, so the swap is instant — the
 * chat store round-trip is too slow to gate visibility on.
 *
 * Known library issues (report to Agenttic UI owners):
 * - Base container is position:absolute at the same specificity as vertical's
 *   position:static; the winner depends on stylesheet order, which Calypso's
 *   build does not preserve. Companion .scss pins it in-flow via data-slot.
 * - translateY defaults to "-100%" in every layout (floats over content).
 * - onSubmit silently requires `prompt` on each suggestion; `label` alone
 *   renders but never fires.
 *
 * Prototype gaps: untranslated copy, no analytics event on chip click.
 */
const PLANS_PRESALES_SUGGESTIONS = [
	{ id: 'compare-plans', label: 'Compare the plans for me', prompt: 'Compare the plans for me' },
	{ id: 'plan-payments', label: 'Which plan has payments?', prompt: 'Which plan has payments?' },
	{
		id: 'business-benefits',
		label: 'What are the main benefits of the Business plan?',
		prompt: 'What are the main benefits of the Business plan?',
	},
];

export const IntroSuggestions = () => {
	const { chat, launcherContext } = useOdieAssistantContext();
	const { sendMessage } = useSendChatMessage();
	const [ askedIds, setAskedIds ] = useState< string[] >( [] );

	if ( launcherContext !== PLANS_PRESALES_LAUNCHER_CONTEXT ) {
		return null;
	}

	const conversationStarted = ( chat?.messages?.length ?? 0 ) > 1 || askedIds.length > 0;
	// A prompt counts as asked if clicked this session OR already present in the
	// conversation history — history survives panel close/reopen, local state doesn't.
	const askedInHistory = ( prompt: string ): boolean =>
		!! chat?.messages?.some( ( m ) => m.role === 'user' && String( m.content ).trim() === prompt );
	const remaining = PLANS_PRESALES_SUGGESTIONS.filter(
		( s ) => ! askedIds.includes( s.id ) && ! askedInHistory( s.prompt )
	);

	if ( remaining.length === 0 ) {
		return null;
	}

	return (
		<Suggestions
			className={ clsx(
				'odie-intro-suggestions',
				conversationStarted && 'odie-intro-suggestions--followups'
			) }
			layout={ conversationStarted ? 'horizontal' : 'vertical' }
			translateY={ 0 }
			suggestions={ remaining }
			onSubmit={ ( selected ) => {
				// The composer disables itself while the bot is busy; mirror that.
				if ( chat?.status && chat.status !== 'loaded' ) {
					return;
				}
				setAskedIds( [ ...askedIds, selected.id ] );
				const messageObj = {
					content: selected.prompt ?? selected.label,
					role: 'user',
					type: 'message',
				} as Message;
				sendMessage( messageObj );
			} }
		/>
	);
};
