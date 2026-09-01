import { Suggestions } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { isAskAiPrototypeEnabled } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import type { Message } from '../../types';
import type { Suggestion } from '@automattic/agenttic-ui';
import './intro-suggestions.scss';

/**
 * Topic-first starter suggestions for the Support Assistant (design
 * prototype, gated by the shared localStorage knob). Fresh chats get a
 * vertical card of the top LANDING_TOPIC_COUNT topics; tapping one surfaces
 * its questions plus a back item. Once the conversation starts, suggestions
 * move to a horizontal follow-up row that stays on the active topic until
 * its questions run out. Topic and back items only switch the local view —
 * their `action` returns false, which Suggestions treats as "do not
 * submit"; only question items carry a real `prompt`.
 */

type TopicQuestion = {
	id: string;
	label: string;
};

type SupportTopic = {
	id: string;
	label: string;
	questions: TopicQuestion[];
};

// The fresh-chat landing card shows this many topics, like the Help Center
// home's recommended guides; the rest stay reachable from the follow-up row.
const LANDING_TOPIC_COUNT = 5;

// Built as a function so the strings are translated at render time, after
// the locale has loaded. Array order is the landing order.
const getSupportTopics = (): SupportTopic[] => [
	{
		id: 'domains',
		label: __( 'Domains', __i18n_text_domain__ ),
		questions: [
			{
				id: 'custom-domain',
				label: __( 'How do I connect a custom domain?', __i18n_text_domain__ ),
			},
			{
				id: 'domain-dns',
				label: __( 'How do I manage DNS records for my domain?', __i18n_text_domain__ ),
			},
			{
				id: 'domain-ssl',
				label: __( 'When does SSL activate on my domain?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'email',
		label: __( 'Email', __i18n_text_domain__ ),
		questions: [
			{
				id: 'pro-email',
				label: __( 'How do I set up a professional email address?', __i18n_text_domain__ ),
			},
			{
				id: 'email-mailboxes',
				label: __( 'How do I rename or remove a mailbox?', __i18n_text_domain__ ),
			},
			{
				id: 'email-forwarding',
				label: __( 'Can I forward email from my custom domain?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'themes',
		label: __( 'Themes & design', __i18n_text_domain__ ),
		questions: [
			{
				id: 'change-theme',
				label: __( "How do I change my site's theme?", __i18n_text_domain__ ),
			},
			{
				id: 'theme-styles',
				label: __( 'Can I change fonts and colors in the Site Editor?', __i18n_text_domain__ ),
			},
			{
				id: 'theme-switch-safe',
				label: __( 'Will switching themes delete my content or menus?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'seo',
		label: __( 'Traffic & SEO', __i18n_text_domain__ ),
		questions: [
			{
				id: 'google-visibility',
				label: __( "Why isn't my site showing up on Google?", __i18n_text_domain__ ),
			},
			{
				id: 'seo-sitemap',
				label: __( 'How do I submit my sitemap to Google?', __i18n_text_domain__ ),
			},
			{
				id: 'seo-basics',
				label: __( 'How do I improve my SEO on WordPress.com?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'backups',
		label: __( 'Backups', __i18n_text_domain__ ),
		questions: [
			{
				id: 'backup-site',
				label: __( 'How do I backup my site?', __i18n_text_domain__ ),
			},
			{
				id: 'backup-restore',
				label: __( 'How do I restore my site from a backup?', __i18n_text_domain__ ),
			},
			{
				id: 'backup-export',
				label: __( 'How do I export my content?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'plans',
		label: __( 'Plans & billing', __i18n_text_domain__ ),
		questions: [
			{
				id: 'manage-plan',
				label: __( 'How do I upgrade or cancel my plan?', __i18n_text_domain__ ),
			},
			{
				id: 'plan-refund',
				label: __( 'Can I get a refund on my plan?', __i18n_text_domain__ ),
			},
			{
				id: 'plan-after-cancel',
				label: __( 'What happens to my site if I cancel my plan?', __i18n_text_domain__ ),
			},
		],
	},
	{
		id: 'users',
		label: __( 'Users', __i18n_text_domain__ ),
		questions: [
			{
				id: 'add-user',
				label: __( 'How do I add another user to my site?', __i18n_text_domain__ ),
			},
			{
				id: 'user-roles',
				label: __( 'What can each user role do on my site?', __i18n_text_domain__ ),
			},
			{
				id: 'user-remove',
				label: __( 'How do I remove a user or change their role?', __i18n_text_domain__ ),
			},
		],
	},
];

export const IntroSuggestions = () => {
	const { chat, trackEvent } = useOdieAssistantContext();
	const { sendMessage } = useSendChatMessage();
	const [ askedIds, setAskedIds ] = useState< string[] >( [] );
	const [ activeTopicId, setActiveTopicId ] = useState< string | null >( null );

	if ( ! isAskAiPrototypeEnabled() ) {
		return null;
	}

	// Mirrors the intro-card gate in messages-container: these are bot-starter
	// prompts, so never render them over a live human (Zendesk) conversation,
	// and not while history is still loading on panel (re)mount.
	if ( chat.provider === 'zendesk' || chat.status === 'loading' ) {
		return null;
	}

	const topics = getSupportTopics();
	// The introduction message is rendered separately and never stored in
	// chat.messages, so any stored message means the conversation started.
	const conversationStarted = ( chat.messages?.length ?? 0 ) > 0 || askedIds.length > 0;
	// The composer disables itself while the bot is busy; question submits
	// mirror that. Browsing topics stays allowed — it sends nothing.
	const isBusy = !! chat.status && chat.status !== 'loaded';

	// A question counts as asked if clicked this session OR already present in
	// the conversation history — history survives panel close/reopen, local
	// state doesn't.
	const askedInHistory = ( label: string ): boolean =>
		!! chat.messages?.some( ( m ) => m.role === 'user' && String( m.content ).trim() === label );
	const isAsked = ( question: TopicQuestion ): boolean =>
		askedIds.includes( question.id ) || askedInHistory( question.label );
	const remainingIn = ( topic: SupportTopic ): TopicQuestion[] =>
		topic.questions.filter( ( question ) => ! isAsked( question ) );

	// A drained topic silently stops being "active" so the render falls back
	// to the topic list — derived per render, no effect needed.
	const activeTopic =
		topics.find( ( t ) => t.id === activeTopicId && remainingIn( t ).length > 0 ) ?? null;

	let items: Suggestion[];
	if ( activeTopic ) {
		items = [
			{
				id: 'intro-topics-back',
				/* translators: compact button returning from a topic's questions to the full topic list */
				label: __( '‹ All topics', __i18n_text_domain__ ),
				action: () => {
					trackEvent( 'chat_intro_topic_back_click', { topic: activeTopic.id } );
					setActiveTopicId( null );
					return false;
				},
			},
			...remainingIn( activeTopic ).map( ( question ) => ( {
				id: question.id,
				label: question.label,
				prompt: question.label,
			} ) ),
		];
	} else {
		const topicsWithQuestions = topics.filter( ( t ) => remainingIn( t ).length > 0 );
		const visibleTopics = conversationStarted
			? topicsWithQuestions
			: topicsWithQuestions.slice( 0, LANDING_TOPIC_COUNT );
		items = visibleTopics.map( ( topic ) => ( {
			id: `topic-${ topic.id }`,
			label: topic.label,
			action: () => {
				trackEvent( 'chat_intro_topic_click', { topic: topic.id } );
				setActiveTopicId( topic.id );
				return false;
			},
		} ) );
	}

	if ( items.length === 0 ) {
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
			suggestions={ items }
			onSubmit={ ( selected ) => {
				if ( isBusy ) {
					return;
				}
				trackEvent( 'chat_intro_suggestion_click', {
					suggestion: selected.id,
					topic: activeTopic?.id,
				} );
				setAskedIds( [ ...askedIds, selected.id ] );
				const messageObj = {
					content: selected.prompt ?? selected.label,
					role: 'user',
					type: 'message',
				} as Message;
				// Aborted sends put the chip back so the question can be retried,
				// mirroring how the composer restores its input on abort.
				sendMessage( messageObj ).catch( ( error: { type?: string } ) => {
					if ( error?.type === 'abort' ) {
						setAskedIds( ( ids ) => ids.filter( ( id ) => id !== selected.id ) );
					}
				} );
			} }
		/>
	);
};
