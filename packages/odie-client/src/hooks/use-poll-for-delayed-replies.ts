import { useEffect, useRef } from 'react';
import { ODIE_CALL_AN_HE_BOT_SLUG } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { fetchOdieChat } from '../data/use-odie-chat';

const POLL_INTERVAL_MS = 5000;

/**
 * Polling stops this long after the last change to the chat, and starts again with the next one.
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
		! isMinimized;

	// Messages added in the browser carry no `created_at`, so keep our own clock: it restarts
	// whenever the message count changes, and on mount.
	const lastChangeRef = useRef( Date.now() );
	const messageCount = chat.messages.length;
	useEffect( () => {
		lastChangeRef.current = Date.now();
	}, [ messageCount ] );

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
					const newestId = Math.max( 0, ...prev.messages.map( ( m ) => m.message_id ?? 0 ) );
					const fresh = fetched.messages.filter(
						( m ) => m.role === 'bot' && ( m.message_id ?? 0 ) > newestId
					);
					return fresh.length ? { ...prev, messages: [ ...prev.messages, ...fresh ] } : prev;
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
