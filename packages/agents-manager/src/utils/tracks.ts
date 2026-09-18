/**
 * Central Tracks wrappers for the Agents Manager.
 *
 * Two record functions, one per base-prop set:
 * - `recordBigSkyTracksEvent` keeps Big Sky's exact event names and props so its
 *   live Looker dashboard keeps working, and mirrors the chat and feedback events
 *   as `calypso_agents_manager_<same suffix>` with the shared props so analysis
 *   can move off the Big Sky family before it is retired. Removable once that
 *   parity is dropped.
 * - `recordAgentsManagerTracksEvent` uses the property schema shared across the new
 *   AI products.
 *
 * Callers pass event names in full — the template-literal parameter types enforce
 * the namespace — so every event is findable by searching the code for its name.
 * Mirrored names are derived, so search for their Big Sky suffix instead.
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { DOLLY_AGENT_ID } from '../constants';
import { getActiveSessionId } from './agent-session';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isReaderChatAgent, isReaderChatHost } from './is-reader-chat-agent';
import { getLoadedProviderIds } from './loaded-provider-ids';
import { getResolvedAgentId } from './resolved-agent-id';
import { getTabId } from './tab-id';

type TracksProps = Record< string, unknown >;

export const BIG_SKY_EVENT_PREFIX = 'jetpack_big_sky_';
export type BigSkyEventName = `${ typeof BIG_SKY_EVENT_PREFIX }${ string }`;

/**
 * Big Sky events also recorded under the Agents Manager name. The rest stay Big
 * Sky-only until the Tracks plan for the family (AM-47) decides whether each
 * one moves or retires; each mirrored name needs registering.
 */
const MIRRORED_BIG_SKY_SUFFIXES = new Set< string >( [
	'chat_input_send_message',
	'chat_suggestions_rendered',
	'chat_suggestion_click',
	'chat_response_rendered',
	'chat_response_action',
	'response_action_thumbs_up',
	'response_action_thumbs_down',
] );

type EditorSelectStore =
	| {
			getCurrentPostType?: () => string | undefined;
			getCurrentPostId?: () => number | undefined;
	  }
	| undefined;

type CoreSelectStore =
	| { getEntityRecord?: ( kind: string, name: string, key?: number ) => unknown }
	| undefined;

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

/**
 * The loaded external provider IDs, sorted so the same provider set always
 * yields the same value; 'none' until the providers load (events can fire
 * before the chat mounts) or when none are configured.
 */
function getProviderIds(): string {
	return getLoadedProviderIds()?.slice().sort().join( ',' ) || 'none';
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
 * Editor-surface page props, mirroring Big Sky's `getCurrentPageProperties`,
 * plus the `surface` claim derived from the same editor-store read.
 */
function getBigSkyPageProps(): TracksProps {
	// `block_editor` only while the `core/editor` store is registered (unlike
	// `isEditorPage()`, this includes custom post types and the site editor);
	// preserved by the catch, omitted on plain wp-admin screens.
	let surfaceProps: TracksProps = {};
	try {
		const editor = select( 'core/editor' ) as EditorSelectStore;
		surfaceProps = editor ? { surface: 'block_editor' } : {};

		const core = select( 'core' ) as CoreSelectStore;
		const postId = editor?.getCurrentPostId?.();
		const siteRecord = core?.getEntityRecord?.( 'root', 'site' ) as
			| { page_on_front?: number }
			| undefined;

		return {
			...surfaceProps,
			post_type: editor?.getCurrentPostType?.() ?? '',
			is_home_page: postId !== undefined && postId === siteRecord?.page_on_front,
		};
	} catch {
		return { ...surfaceProps, post_type: '', is_home_page: false };
	}
}

/**
 * Records an event under Big Sky's exact name and props so the existing Big Sky
 * dashboards keep working, then mirrors chat and feedback events under the
 * Agents Manager name.
 */
export function recordBigSkyTracksEvent(
	eventName: BigSkyEventName,
	props: TracksProps = {}
): void {
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
		sessionid: getActiveSessionId(),
		session_type: bigSky.sessionType,
		// AM has no onboarding flow, so the phase is always the editor.
		phase: 'editor',
		big_sky_version: bigSky.bigSkyVersion,
		screen: bigSky.screen,
		provider_ids: getProviderIds(),
		...getBigSkyPageProps(),
	};

	const mergedProps: TracksProps = { ...baseProps, ...props };
	// Send the session ID under both names: `ai_session_id` is the standard one,
	// and `sessionid` is the older one that dashboards still use. The alias
	// copies the final `sessionid`, so a caller-supplied value stays mirrored.
	if ( ! ( 'ai_session_id' in mergedProps ) ) {
		const effectiveSessionId = mergedProps.sessionid;
		if ( typeof effectiveSessionId === 'string' && effectiveSessionId !== '' ) {
			mergedProps.ai_session_id = effectiveSessionId;
		}
	}

	recordTracksEvent( eventName, mergedProps );

	const suffix = eventName.slice( BIG_SKY_EVENT_PREFIX.length );
	if ( MIRRORED_BIG_SKY_SUFFIXES.has( suffix ) ) {
		recordAgentsManagerTracksEvent( `calypso_agents_manager_${ suffix }`, props );
	}
}

/**
 * The running build's version: the Jetpack-injected `{variant}:{version}` on
 * wp-admin surfaces, or Calypso's own commit on Calypso-rendered pages.
 */
function getAgentManagerVersion(): string {
	const injected = getAgentsManagerInlineData()?.version;
	if ( typeof injected === 'string' && injected !== '' ) {
		return injected;
	}

	const commitSha = typeof window !== 'undefined' ? window.COMMIT_SHA : undefined;
	if ( typeof commitSha === 'string' && commitSha !== '' ) {
		// Local dev servers render the document with COMMIT_SHA set to '(unknown)'.
		return 'calypso:' + ( commitSha === '(unknown)' ? 'dev' : commitSha );
	}

	return 'none';
}

function hasEditorStore(): boolean {
	try {
		return !! select( 'core/editor' );
	} catch {
		return false;
	}
}

/**
 * Where the chat runs. The block editor keeps the historical `editor` value.
 * Injected `agentsManagerData` means a wp-admin host (Jetpack, Woo AI); its
 * absence means a Calypso-rendered page.
 */
function getAgentsManagerSurface(): string {
	if ( isReaderChatHost() ) {
		return 'reader-chat';
	}
	if ( hasEditorStore() ) {
		return 'editor';
	}
	const inlineData = getAgentsManagerInlineData();
	if ( ! inlineData ) {
		return 'calypso';
	}
	return 'wp-admin';
}

function getAgentsManagerBaseProps(): TracksProps {
	const isA11n = getIsA11n();
	const blogId = getBlogId();
	return {
		ai_session_id: getActiveSessionId(),
		// Joins the events before the server assigns a session to the conversation.
		tab_id: getTabId(),
		agent_name: getResolvedAgentId() ?? DOLLY_AGENT_ID,
		agent_manager_version: getAgentManagerVersion(),
		provider_ids: getProviderIds(),
		surface: getAgentsManagerSurface(),
		...( typeof window !== 'undefined' && window.pagenow ? { screen: window.pagenow } : {} ),
		path: typeof window !== 'undefined' ? window.location.pathname : '',
		is_test: getIsTest(),
		...( isA11n !== undefined ? { is_a11n: isA11n } : {} ),
		...( blogId !== undefined ? { blog_id: blogId } : {} ),
	};
}

/**
 * Records an Agents Manager event using the shared property names.
 */
export function recordAgentsManagerTracksEvent(
	eventName: `calypso_agents_manager_${ string }`,
	props: TracksProps = {}
): void {
	recordTracksEvent( eventName, { ...getAgentsManagerBaseProps(), ...props } );
}

/**
 * The Tracks props for a wp-admin route: the pathname and the `page` and
 * `post_type` query args that name the screen. Other query values can carry
 * search terms and IDs, so they are never recorded. Never throws, so it is
 * safe beside a send.
 */
export function getWpAdminRouteTracksProps( href: string ) {
	try {
		const url = new URL( href, window.location.origin );
		return {
			path: url.pathname,
			page: url.searchParams.get( 'page' ) ?? '',
			postType: url.searchParams.get( 'post_type' ) ?? '',
		};
	} catch {
		return { path: '', page: '', postType: '' };
	}
}
