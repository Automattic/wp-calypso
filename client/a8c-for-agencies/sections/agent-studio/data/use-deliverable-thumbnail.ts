/**
 * Resolves the thumbnail frame for an overview deliverable card. Reuses the
 * detail page's data hooks and composer (no new endpoint surface):
 *
 * - One-pager → the linked collateral's first variant `html_url`, switched
 *   into `layout=filmstrip` and loaded directly as a cross-origin `<iframe
 *   src>` (the wpcom renderer lays the pages out and self-fits them).
 * - Social → the run's brief composed client-side into tiles, of which the
 *   representative landscape tile is shown.
 *
 * `useAgentStudioRun` is shared with the detail view (React Query dedupes).
 * The one-pager path adds only the collateral request; social composes
 * client-side. Both only once the deliverable is `ready`.
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
	composeSocialAssetsFromBrief,
	type ServerSocialBrief,
} from '../social-design/create-social-assets';
import {
	buildOnePagerFrame,
	buildSocialFrame,
	type ThumbnailFrame,
} from './build-thumbnail-frames';
import useAgentStudioCollateral from './use-agent-studio-collateral';
import useAgentStudioRun, { type AgentStudioRunPayload } from './use-agent-studio-run';
import type { AgentStudioOutput } from '../types';

const SOCIAL_DELIVERABLE_TYPE = 'social-assets';

// Cover plus following pages, laid out as a filmstrip by the renderer; the row
// clips so a longer document shows a partial trailing page.
const FILMSTRIP_PAGES = 4;

const extractPostId = ( payload: unknown ): number | undefined => {
	if ( ! payload || typeof payload !== 'object' ) {
		return undefined;
	}
	const candidate = ( payload as AgentStudioRunPayload ).post_id;
	return typeof candidate === 'number' && candidate > 0 ? candidate : undefined;
};

interface SocialRunPayload extends AgentStudioRunPayload {
	brief?: ServerSocialBrief;
}

const extractSocialBrief = ( payload: unknown ): ServerSocialBrief | undefined => {
	if ( ! payload || typeof payload !== 'object' ) {
		return undefined;
	}
	const brief = ( payload as SocialRunPayload ).brief;
	if ( ! brief || typeof brief !== 'object' || typeof brief.headline !== 'string' ) {
		return undefined;
	}
	return brief;
};

export interface DeliverableThumbnail {
	frames: ThumbnailFrame[];
	/** One-pager (horizontal page row) vs social (single centered tile). */
	isFilmstrip: boolean;
	isLoading: boolean;
	isError: boolean;
}

export default function useDeliverableThumbnail( output: AgentStudioOutput ): DeliverableThumbnail {
	const isOnePager = output.deliverableType !== SOCIAL_DELIVERABLE_TYPE;
	const isReady = output.status === 'ready';
	const wantsOnePager = isOnePager && isReady;
	const wantsSocial = ! isOnePager && isReady;

	const run = useAgentStudioRun( output.id );
	const postId = extractPostId( run.data?.payload );
	const brief = extractSocialBrief( run.data?.payload );

	const collateral = useAgentStudioCollateral( wantsOnePager ? postId : undefined );
	const htmlUrl = collateral.data?.variants?.[ 0 ]?.html_url;

	const social = useQuery( {
		queryKey: [ 'a4a-agent-studio-social-tiles', output.id, brief ],
		queryFn: () => composeSocialAssetsFromBrief( { brief: brief as ServerSocialBrief } ),
		enabled: wantsSocial && !! brief,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	} );

	const frame = useMemo( () => {
		if ( wantsOnePager ) {
			return buildOnePagerFrame( htmlUrl, FILMSTRIP_PAGES );
		}
		if ( wantsSocial ) {
			return buildSocialFrame( social.data?.assets );
		}
		return null;
	}, [ wantsOnePager, wantsSocial, htmlUrl, social.data ] );

	const frames = frame ? [ frame ] : [];
	const isError = collateral.isError || social.isError;
	// Only show the loading state while the chain can still produce a frame.
	// A ready run that never yields a `post_id` / brief settles to the
	// placeholder rather than spinning forever.
	const isResolving =
		run.isLoading ||
		( wantsOnePager && !! postId && collateral.isLoading ) ||
		( wantsSocial && !! brief && social.isLoading );
	const isLoading = frames.length === 0 && ! isError && isResolving;

	return { frames, isFilmstrip: wantsOnePager, isLoading, isError };
}
