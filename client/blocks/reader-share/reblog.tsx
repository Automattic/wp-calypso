import { useConstrainedTabbing } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import SiteSelector from 'calypso/components/site-selector';
import ReaderPopover from 'calypso/reader/components/reader-popover';
import * as stats from 'calypso/reader/stats';
import { getLocation } from 'calypso/reader/stats';
import { useDispatch, useSelector } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getPreviousPath } from 'calypso/state/selectors/get-previous-path';
import type { TrackPostData } from 'calypso/state/reader/analytics/types';
import type { ComponentProps } from 'react';

export interface ReblogPost extends TrackPostData {
	URL: string;
}

interface ReblogComment {
	content: string;
	author?: {
		name?: string;
	};
}

interface ReaderReblogSelectionProps {
	post: ReblogPost;
	comment?: ReblogComment;
	popoverProps: ComponentProps< typeof ReaderPopover >;
	closeMenu: () => void;
}

const ReaderReblogSelection = ( props: ReaderReblogSelectionProps ) => {
	const translate = useTranslate();
	const constrainedTabbingRef = useConstrainedTabbing();
	const dispatch = useDispatch();
	const currentPath = useSelector( getCurrentRoute );
	const previousPath = useSelector( getPreviousPath );

	const buildQuerystringForPost = ( post: ReblogPost, comment?: ReblogComment ) => {
		const args: Record< string, string > = {};

		args.url = post.URL;
		args.is_post_share = 'true'; // There is a dependency on this here https://github.com/Automattic/wp-calypso/blob/a69ded693a99fa6a957b590b1a538f32a581eb8a/client/gutenberg/editor/controller.js#L209

		if ( comment ) {
			args.comment_content = comment.content;
			args.comment_author = comment.author?.name ?? '';
		}

		const params = new URLSearchParams( args );
		return params.toString();
	};

	const pickSiteToShareTo = ( slug: string ) => {
		// Add 'comment' specificity to stats and tracks names if this is for a comment.
		stats.recordAction( `share_wordpress${ props.comment ? '_comment' : '' }` );
		stats.recordGaEvent( `Clicked on Share${ props.comment ? ' Comment' : '' } to WordPress` );
		const statsLocation = getLocation( currentPath );
		const pathnameOverride = statsLocation === 'single_post' ? previousPath : undefined;

		dispatch(
			recordReaderTracksEvent(
				`calypso_reader_share${ props.comment ? '_comment' : '' }_to_site`,
				{},
				{ pathnameOverride, post: props.post }
			)
		);
		window.open(
			`/post/${ slug }?${ buildQuerystringForPost( props.post, props.comment ) }`,
			'_blank'
		);
		props.closeMenu();
		return true;
	};

	return (
		<ReaderPopover
			{ ...props.popoverProps }
			nodeRef={ constrainedTabbingRef }
			popoverTitle={ translate( 'Repost on' ) }
			onClose={ props.closeMenu }
		>
			{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
			<div onClick={ ( event ) => event.stopPropagation() }>
				<SiteSelector
					className="reader-share__site-selector"
					onSiteSelect={ pickSiteToShareTo }
					groups
				/>
			</div>
		</ReaderPopover>
	);
};

export default ReaderReblogSelection;
