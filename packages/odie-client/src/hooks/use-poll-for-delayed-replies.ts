import { useEffect, useRef } from 'react';
import { ODIE_CALL_AN_HE_BOT_SLUG } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { fetchOdieChat } from '../data/use-odie-chat';
import {
	getIsRequestingHumanSupport,
	getTimestamp,
	hasCSATMessage,
	interactionHasEnded,
	isStaleOdieChat,
} from '../utils';

const POLL_INTERVAL_MS = 5000;

/**
 * Polling stops this long after the last change to the chat, and starts again with the next one.
 * The server job makes its last check about 14 minutes after the question (first after 5, then up
 * to three more 3 minutes apart), writes a bot message after each, and ends; an answer that comes
 * later is not relayed. So nothing can arrive later than this after the newest message.
 */
const QUIET_PERIOD_MS = 20 * 60 * 1000;

/**
 * The Call an HE bot can answer a while after the customer's last message: a server job writes
 * the colleague's reply into the chat as a new bot message, with no customer message in between.
 * Nothing in the widget fetches the chat while it sits idle, so poll it for sampled users only
 * (those on the Call an HE bot) and append the bot messages that are new.
 *
 * This fetches the chat directly instead of adding `refetchInterval` to `useOdieChat`:
 * `useGetCombinedChat` copies the query result into the chat only while the status is `loading`,
 * so a background refetch alone shows nothing.
 */
export const usePollForDelayedReplies = () => {
	const { chat, setChat, isMinimized, version } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();

	const shouldPoll =
		currentSupportInteraction?.bot_slug === ODIE_CALL_AN_HE_BOT_SLUG &&
		chat.provider === 'odie' &&
		chat.status === 'loaded' &&
		!! chat.odieId &&
		! isMinimized &&
		// A closed chat gets no reply: the same three checks that show the closed footer.
		! hasCSATMessage( chat ) &&
		! interactionHasEnded( currentSupportInteraction ) &&
		! isStaleOdieChat( chat );

	// The clock restarts whenever the message count changes, from the newest message's
	// `created_at` when it has one, so a chat opened from history counts from its last message.
	// Messages added in the browser carry no `created_at`, so those count from now.
	const lastChangeRef = useRef( Date.now() );
	const messageCount = chat.messages.length;
	const newestCreatedAt = chat.messages[ messageCount - 1 ]?.created_at;
	useEffect( () => {
		const createdAt = newestCreatedAt ? getTimestamp( newestCreatedAt ) * 1000 : NaN;
		lastChangeRef.current = Number.isFinite( createdAt ) ? createdAt : Date.now();
	}, [ messageCount, newestCreatedAt ] );

	const chatId = chat.odieId;
	const botSlug = currentSupportInteraction?.bot_slug;

	useEffect( () => {
		if ( ! shouldPoll || ! chatId || ! botSlug ) {
			return;
		}

		let isFetching = false;

		const tick = async () => {
			if (
				isFetching ||
				document.visibilityState !== 'visible' ||
				Date.now() - lastChangeRef.current > QUIET_PERIOD_MS
			) {
				return;
			}

			isFetching = true;
			try {
				const fetched = await fetchOdieChat( { botSlug, chatId, version } );

				// Checked against the chat as it is now, not as it was when the fetch started: a
				// send may have run in between and already added the same bot reply.
				setChat( ( prev ) => {
					if ( prev.status !== 'loaded' || prev.provider !== 'odie' || prev.odieId !== chatId ) {
						return prev;
					}
					// The server ids of the messages already on screen.
					const idsOnScreen = new Set( prev.messages.map( ( m ) => m.message_id ) );
					// `fresh` holds the fetched messages the poll adds to the screen. A message is added when
					// all of these hold:
					// - role is bot;
					// - it has an id and that id is not on screen yet;
					// - it does not ask for a human: the send handler already handled the bot's answer that
					//   asked for one, by showing its own prompt without a server id, so the id check cannot
					//   catch it. A hand-off the server job writes on its own shows on the next focus
					//   refresh or reload.
					const fresh = fetched.messages.filter(
						( m ) =>
							m.role === 'bot' &&
							!! m.message_id &&
							! idsOnScreen.has( m.message_id ) &&
							! getIsRequestingHumanSupport( m )
					);
					if ( ! fresh.length ) {
						return prev;
					}

					// A reply written just before the customer's next message has a lower id than the
					// bot's answer to it, so it goes in front of that answer. The customer's own messages
					// are added in the browser without an id: the ones right before the answer belong to
					// the same exchange, so the reply goes in front of them too.
					const messages = [ ...prev.messages ];
					for ( const message of fresh ) {
						let at = messages.findIndex(
							( existing ) => ( existing.message_id ?? 0 ) > ( message.message_id ?? 0 )
						);
						if ( at === -1 ) {
							messages.push( message );
							continue;
						}
						while ( at > 0 && ! messages[ at - 1 ].message_id ) {
							at--;
						}
						messages.splice( at, 0, message );
					}
					return { ...prev, messages };
				} );
			} catch {
				// Ignored: the next tick tries again.
			} finally {
				isFetching = false;
			}
		};

		const timer = setInterval( tick, POLL_INTERVAL_MS );
		return () => clearInterval( timer );
	}, [ shouldPoll, chatId, botSlug, version, setChat ] );
};
