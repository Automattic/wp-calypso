import { Suggestions } from '@automattic/agenttic-ui';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useMemo } from 'react';
import { isPlansPresalesExperience, PLANS_PRESALES_LAUNCHER_CONTEXT } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import type { Message } from '../../types';
import './intro-suggestions.scss';

// `original` is the untranslated source string hasEnTranslation checks against;
// `copy` repeats it literally inside __() so string extraction picks it up.
const PLANS_PRESALES_SUGGESTIONS = [
	{
		id: 'compare-plans',
		original: 'Compare the plans for me',
		copy: () => __( 'Compare the plans for me', __i18n_text_domain__ ),
	},
	{
		id: 'plan-payments',
		original: 'Which plan has payments?',
		copy: () => __( 'Which plan has payments?', __i18n_text_domain__ ),
	},
	{
		id: 'business-benefits',
		original: 'What are the main benefits of the Business plan?',
		copy: () => __( 'What are the main benefits of the Business plan?', __i18n_text_domain__ ),
	},
];

const PlansPresalesSuggestions = () => {
	const { chat, launcherContext, trackEvent } = useOdieAssistantContext();
	const { sendMessage } = useSendChatMessage();
	const hasEnTranslation = useHasEnTranslation();

	// A prompt counts as asked once it appears in the conversation history,
	// which survives panel close/reopen.
	const { conversationStarted, remaining } = useMemo( () => {
		const askedPrompts = new Set(
			( chat?.messages ?? [] )
				.filter( ( message ) => message.role === 'user' )
				.map( ( message ) => String( message.content ).trim() )
		);
		return {
			conversationStarted: askedPrompts.size > 0,
			remaining: PLANS_PRESALES_SUGGESTIONS.filter( ( suggestion ) =>
				hasEnTranslation( suggestion.original, undefined, __i18n_text_domain__ )
			)
				.map( ( suggestion ) => {
					const copy = suggestion.copy();
					return { id: suggestion.id, label: copy, prompt: copy };
				} )
				.filter( ( suggestion ) => ! askedPrompts.has( suggestion.prompt ) ),
		};
	}, [ chat?.messages, hasEnTranslation ] );

	if (
		! isPlansPresalesExperience( launcherContext, hasEnTranslation ) ||
		// Never post a presales prompt into an escalated human conversation.
		chat?.provider === 'zendesk' ||
		remaining.length === 0
	) {
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
				trackEvent( 'chat_presales_suggestion_click', {
					suggestion_id: selected.id,
					suggestion_layout: conversationStarted ? 'followup_row' : 'intro_stack',
				} );
				const messageObj = {
					content: selected.prompt ?? selected.label,
					role: 'user',
					type: 'message',
				} as Message;
				sendMessage( messageObj ).catch( () => {} );
			} }
		/>
	);
};

// Starter-prompt chips for the plans-presales assistant: stacked under the
// greeting at first, then a compact follow-up row of not-yet-asked prompts.
export const IntroSuggestions = () => {
	const { launcherContext } = useOdieAssistantContext();

	if ( launcherContext !== PLANS_PRESALES_LAUNCHER_CONTEXT ) {
		return null;
	}

	return <PlansPresalesSuggestions />;
};
