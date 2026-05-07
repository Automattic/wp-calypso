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
}

/**
 * Map a phase + render-progress pair to the user-facing label. Returns null
 * when there's no Highlights render in flight, signalling the caller should
 * fall back to the default agent thinking copy.
 */
export function buildFeatureClipThinkingLabel( {
	hasPending,
	phase,
	renderProgress,
}: FeatureClipThinkingState ): string | null {
	if ( ! hasPending ) {
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
 * during a Highlights render, or `null` when the agent's default copy
 * ("Thinking…") should win.
 */
export function useFeatureClipThinkingLabel(): string | null {
	return useSelect( ( select ) => {
		const store = select( videoStudioStore );
		const pending = store.getPendingFeatureClipRender();
		const phase = store.getFeatureClipProgressPhase();
		const renderProgress = store.getFeatureClipRenderProgress();
		return buildFeatureClipThinkingLabel( {
			hasPending: !! pending,
			phase,
			renderProgress,
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
