/**
 * The "Discover new blogs" spot in the Recent feed, gated by the READ-543 A/B.
 *
 * The caller mounts this in the stream only where the module could show: flag
 * on, the "all subscriptions" feed, the user has recs and hasn't hidden the
 * module. It mounts in both groups, so both are assigned at the same point and
 * are the same kind of user; only treatment sees the module.
 *
 * See client/reader/new-blogs/README.md.
 */
import { useExperiment } from 'calypso/lib/explat';
import DiscoverNewBlogs from './index';
import type { ComponentProps } from 'react';

export const NEW_BLOGS_EXPERIMENT = 'calypso_reader_discover_new_blogs_202610_v1';

export default function NewBlogsExperimentSlot( props: ComponentProps< typeof DiscoverNewBlogs > ) {
	const [ isLoading, assignment ] = useExperiment( NEW_BLOGS_EXPERIMENT );

	if ( isLoading || assignment?.variationName !== 'treatment' ) {
		return null;
	}

	return <DiscoverNewBlogs { ...props } />;
}
