/**
 * Central Tracks wrappers for the Agents Manager.
 *
 * Two record functions because each injects a different base-prop set:
 * - `recordBigSkyTracksEvent` keeps Big Sky's exact event names and props so its
 *   live Looker dashboard keeps working. Removable once that parity is dropped.
 * - `recordAgentsManagerTracksEvent` uses the unified property schema shared across the new
 *   AI products.
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { DOLLY_AGENT_ID } from '../constants';
import { getSessionId } from './agent-session';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isReaderChatAgent, isReaderChatHost } from './is-reader-chat-agent';
import { getResolvedAgentId } from './resolved-agent-id';

type TracksProps = Record< string, unknown >;

type EditorSelectStore =
	| {
			getCurrentPostType?: () => string | undefined;
			getCurrentPostId?: () => number | undefined;
	  }
	| undefined;

type CoreSelectStore =
	| { getEntityRecord?: ( kind: string, name: string, key?: number ) => unknown }
	| undefined;

const BIG_SKY_EVENT_PREFIX = 'jetpack_big_sky_';
const AM_UNIFIED_EVENT_PREFIX = 'calypso_agents_manager_';

/** Reads the optional server-provided Automattician tracking signal. */
function getIsA11n(): boolean | undefined {
	const isA11n = getAgentsManagerInlineData()?.isA11n;
	return typeof isA11n === 'boolean' ? isA11n : undefined;
}

/** Reads the canonical server-provided blog ID when available. */
function getBlogId(): number | undefined {
	const blogId = getAgentsManagerInlineData()?.site?.ID;
	return typeof blogId === 'number' && Number.isInteger( blogId ) && blogId > 0
		? blogId
		: undefined;
}

type BigSkyTracksData = {
	bigSkyVersion: string;
	sessionType: string;
	screen: string;
	isDevMode: boolean;
};

/**
 * Resolves the Big Sky base props AM mirrors, from `window.bigSkyInitialState`.
 */
export function getBigSkyTracksData(): BigSkyTracksData {
	const state = typeof window !== 'undefined' ? window.bigSkyInitialState : undefined;
	if ( ! state ) {
		return { bigSkyVersion: '0', sessionType: 'unknown', screen: 'site-editor', isDevMode: false };
	}

	return {
		bigSkyVersion: state.bigSkyVersion ?? '0',
		sessionType: state.isFreeTrial ? 'free-trial-session' : 'paid-user-session',
		screen: state.currentScreen?.screen ?? 'site-editor',
		isDevMode: !! state.isDevMode,
	};
}

function getIsTest(): boolean {
	const amDevMode = typeof agentsManagerData !== 'undefined' && !! agentsManagerData?.isDevMode;
	return amDevMode || getBigSkyTracksData().isDevMode;
}

/**
 * Editor-surface page props, mirroring Big Sky's `getCurrentPageProperties`.
 */
function getBigSkyPageProps(): TracksProps {
	try {
		const editor = select( 'core/editor' ) as EditorSelectStore;
		const core = select( 'core' ) as CoreSelectStore;

		const postId = editor?.getCurrentPostId?.();
		const siteRecord = core?.getEntityRecord?.( 'root', 'site' ) as
			| { page_on_front?: number }
			| undefined;

		return {
			post_type: editor?.getCurrentPostType?.() ?? '',
			is_home_page: postId !== undefined && postId === siteRecord?.page_on_front,
		};
	} catch {
		return { post_type: '', is_home_page: false };
	}
}

/**
 * Records an event under Big Sky's exact name and props so the existing Big Sky
 * dashboards keep working.
 */
export function recordBigSkyTracksEvent( eventName: string, props: TracksProps = {} ): void {
	if ( isReaderChatAgent( getResolvedAgentId() ) ) {
		return; // Big Sky parity events are editor-only; never on reader-chat.
	}

	const bigSky = getBigSkyTracksData();
	const isA11n = getIsA11n();
	const blogId = getBlogId();
	const baseProps: TracksProps = {
		is_test: getIsTest(),
		...( isA11n !== undefined ? { is_a11n: isA11n } : {} ),
		...( blogId !== undefined ? { blog_id: blogId } : {} ),
		sessionid: getSessionId(),
		session_type: bigSky.sessionType,
		// AM has no onboarding flow, so the phase is always the editor.
		phase: 'editor',
		big_sky_version: bigSky.bigSkyVersion,
		screen: bigSky.screen,
		...getBigSkyPageProps(),
	};

	recordTracksEvent( `${ BIG_SKY_EVENT_PREFIX }${ eventName }`, { ...baseProps, ...props } );
}

function getUnifiedBaseProps(): TracksProps {
	const isA11n = getIsA11n();
	const blogId = getBlogId();
	return {
		ai_session_id: getSessionId(),
		agent_name: DOLLY_AGENT_ID,
		surface: isReaderChatHost() ? 'reader-chat' : 'editor',
		path: typeof window !== 'undefined' ? window.location.pathname : '',
		is_test: getIsTest(),
		...( isA11n !== undefined ? { is_a11n: isA11n } : {} ),
		...( blogId !== undefined ? { blog_id: blogId } : {} ),
	};
}

/**
 * Records an Agents Manager event using the shared unified property names.
 * `eventName` is a suffix appended to the `calypso_agents_manager_` prefix.
 */
export function recordAgentsManagerTracksEvent( eventName: string, props: TracksProps = {} ): void {
	recordFullNameAgentsManagerTracksEvent( `${ AM_UNIFIED_EVENT_PREFIX }${ eventName }`, props );
}

/**
 * Records an event under its full name with the same unified base props as
 * `recordAgentsManagerTracksEvent` — for the entry-point events that carry
 * their own host prefix (e.g. `calypso_editor_agents_manager_ai_chat_clicked`).
 */
export function recordFullNameAgentsManagerTracksEvent(
	eventName: string,
	props: TracksProps = {}
): void {
	recordTracksEvent( eventName, { ...getUnifiedBaseProps(), ...props } );
}
