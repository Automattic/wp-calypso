import { useTranslate } from 'i18n-calypso';
import SiteSelector from 'calypso/components/site-selector';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import * as stats from 'calypso/reader/stats';

const ReaderReblogSelection = ( props ) => {
	const translate = useTranslate();

	const buildQuerystringForPost = ( post, comment ) => {
		const args = {};

		args.url = post.URL;
		args.is_post_share = true; // There is a dependency on this here https://github.com/Automattic/wp-calypso/blob/a69ded693a99fa6a957b590b1a538f32a581eb8a/client/gutenberg/editor/controller.js#L209

		if ( comment ) {
			args.comment_content = comment.content;
			args.comment_author = comment.author?.name;
		}

		const params = new URLSearchParams( args );
		return params.toString();
	};

	const pickSiteToShareTo = ( slug ) => {
		stats.recordAction( 'share_wordpress' );
		stats.recordGaEvent( 'Clicked on Share to WordPress' );
		stats.recordTrack( 'calypso_reader_share_to_site' );
		window.open(
			`/post/${ slug }?${ buildQuerystringForPost( props.post, props.comment ) }`,
			'reblog post',
			'width=550,height=420,resizeable,scrollbars'
		);
		props.closeMenu();
		return true;
	};

	return (
		<ReaderPopoverMenu
			{ ...props.popoverProps }
			popoverTitle={ translate( 'Reblog on' ) }
			onClose={ props.closeMenu }
		>
			<SiteSelector
				className="reader-share__site-selector"
				onSiteSelect={ pickSiteToShareTo }
				groups
			/>
		</ReaderPopoverMenu>
	);
};

export default ReaderReblogSelection;
