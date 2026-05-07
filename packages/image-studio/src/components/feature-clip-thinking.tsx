/**
 * Phase-aware "Thinking…" indicator for the Highlights (feature-clip) flow.
 *
 * The Highlights browser-side render blocks the agent loop for ~60–120s
 * while EditFrame composes, renders, and uploads the MP4. Without this,
 * users see a static "Thinking…" the whole time. This component watches
 * the videoStudio store and surfaces the actual phase + render percentage.
 *
 * Mounting strategy: AgentUI's `thinkingMessage` prop accepts a string
 * (see node_modules/@automattic/agenttic-ui/dist/types/index.d.ts), so the
 * cleanest integration is to compute the label as a string and pass it
 * through that prop. That keeps the default agenttic-ui ThinkingMessage
 * shell (sparkle icon + animated dots) and only overrides the text.
 *
 * Consumers can either:
 *   - call `useFeatureClipThinkingLabel()` to get the override string (or
 *     `null` when there's no Highlights render in flight), or
 *   - render `<FeatureClipThinking />` for a standalone indicator that
 *     wraps `<ThinkingMessage>` with the same store-driven label.
 */
import { ThinkingMessage } from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as videoStudioStore } from '../stores/video-studio';
import type { FeatureClipProgressPhase } from '../stores/video-studio';

interface FeatureClipThinkingState {
	hasPending: boolean;
	phase: FeatureClipProgressPhase;
	renderProgress: number | null;
	/**
	 * The currently-selected video style. Used to show a Highlights-specific
	 * label during the *pre-render* window (server-side compose-video tool call
	 * incl. LLM summarization, typically 5–10s). Without this, the user just
	 * sees "Thinking…" while the bulk of the work happens server-side before
	 * any phase fires.
	 */
	selectedStyle: string | null;
}

/**
 * Map state → user-facing label. Returns null when neither a pending render
 * nor an active Highlights flow exists, signalling the caller should fall
 * back to the default agent thinking copy ("Thinking…").
 */
export function buildFeatureClipThinkingLabel( {
	hasPending,
	phase,
	renderProgress,
	selectedStyle,
}: FeatureClipThinkingState ): string | null {
	if ( ! hasPending ) {
		// Pre-render window (server tool call in flight + the brief flowing back
		// through the agent). One label covers the whole compose-video step;
		// once requestFeatureClipRender fires on the client side, the phase-
		// specific labels below take over.
		if ( selectedStyle === 'highlights' ) {
			return __( 'Composing your highlights…', __i18n_text_domain__ );
		}
		return null;
	}
	switch ( phase ) {
		case 'analyzing':
			return __( 'Reading post images…', __i18n_text_domain__ );
		case 'composing':
			return __( 'Composing the clip…', __i18n_text_domain__ );
		case 'rendering':
			if ( renderProgress !== null ) {
				const pct = Math.max( 0, Math.min( 100, Math.round( renderProgress * 100 ) ) );
				/* translators: %d: integer percentage 0-100 of frames rendered */
				return sprintf( __( 'Rendering frames… (%d%%)', __i18n_text_domain__ ), pct );
			}
			return __( 'Rendering frames…', __i18n_text_domain__ );
		case 'uploading':
			return __( 'Uploading to media library…', __i18n_text_domain__ );
		case 'idle':
		default:
			return null;
	}
}

/**
 * Hook returning the override label for the AgentUI thinking indicator
 * during a Highlights flow (both the pre-render server tool call and the
 * client-side render phases), or `null` when the agent's default copy
 * ("Thinking…") should win.
 */
export function useFeatureClipThinkingLabel(): string | null {
	return useSelect( ( select ) => {
		const store = select( videoStudioStore ) as ReturnType<
			typeof select< typeof videoStudioStore >
		> & {
			getSelectedStyle?: () => string | null;
		};
		const pending = store.getPendingFeatureClipRender();
		const phase = store.getFeatureClipProgressPhase();
		const renderProgress = store.getFeatureClipRenderProgress();
		const selectedStyle = store.getSelectedStyle?.() ?? null;
		return buildFeatureClipThinkingLabel( {
			hasPending: !! pending,
			phase,
			renderProgress,
			selectedStyle,
		} );
	}, [] );
}

/**
 * Standalone phase-aware indicator. Falls back to a plain `<ThinkingMessage>`
 * (no `content`) when there's no Highlights render in flight.
 */
export function FeatureClipThinking() {
	const label = useFeatureClipThinkingLabel();
	return <ThinkingMessage content={ label ?? undefined } />;
}
