import { fetchWowFunnelPending, type WowFunnelPending } from '@automattic/api-core';
import { wowFunnelPendingQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

interface MaybePreviewSite {
	ID: number;
	is_wpcom_atomic?: boolean;
	plan?: { is_free: boolean };
}

/**
 * Only an Atomic site on the Free plan can be a preview its owner has not bought, so only one asks.
 * @param site The site being launched.
 * @returns Whether the site is worth asking about.
 */
function couldBePreview( site: MaybePreviewSite | null | undefined ): site is MaybePreviewSite {
	return !! site?.is_wpcom_atomic && !! site.plan?.is_free;
}

function listsSite( pending: WowFunnelPending | null | undefined, siteId: number ): boolean {
	return !! pending?.preview_sites?.some( ( preview ) => preview.blog_id === siteId );
}

/**
 * Is this a preview site its owner has not bought yet? A preview is launched by buying it: the
 * purchase launches it, and launching it unpaid is refused.
 * @param site The site being launched.
 * @returns Whether the site is an unbought preview.
 */
export async function isPreviewSite( site: MaybePreviewSite | null | undefined ) {
	if ( ! couldBePreview( site ) ) {
		return false;
	}

	const pending = await fetchWowFunnelPending().catch( () => null );

	return listsSite( pending, site.ID );
}

/**
 * The same answer for a step that renders while it is asked.
 * @param site The site being launched.
 * @returns Whether the answer is still loading, and whether the site is an unbought preview.
 */
export function useIsPreviewSite( site: MaybePreviewSite | null | undefined ) {
	const enabled = couldBePreview( site );
	const { data, isLoading } = useQuery( { ...wowFunnelPendingQuery(), enabled } );

	return {
		isLoading: enabled && isLoading,
		isPreview: couldBePreview( site ) && listsSite( data, site.ID ),
	};
}
